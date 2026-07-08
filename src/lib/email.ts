import nodemailer from 'nodemailer';
import { supabaseServer } from './supabase-server';

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: 'b139eb001@smtp-brevo.com',
    pass: 'CRAKW8mJt61ZFNrM',
  },
});

export async function sendOrderEmail(orderId: number) {
  try {
    // 1. Fetch order details
    const { data: order, error: orderErr } = await supabaseServer
      .from('orders')
      .select(`
        id, total, status, profile_id,
        address:shipping_address_id(*)
      `)
      .eq('id', orderId)
      .single();

    if (orderErr || !order) {
      console.error('Error fetching order for email:', orderErr);
      return;
    }

    if (!order.profile_id) {
      console.error('Order has no profile_id');
      return;
    }

    // 2. Fetch profile info
    const { data: profile, error: profileErr } = await supabaseServer
      .from('profiles')
      .select('name, phone, cpf')
      .eq('id', order.profile_id)
      .single();

    if (profileErr || !profile) {
      console.error('Error fetching profile for email:', profileErr);
      return;
    }

    // 3. Fetch user email from Auth
    const { data: authUser, error: authErr } = await supabaseServer.auth.admin.getUserById(order.profile_id);
    if (authErr || !authUser?.user) {
      console.error('Error fetching auth user for email:', authErr);
      return;
    }

    const email = authUser.user.email;
    if (!email) return;

    // 4. Fetch order items
    const { data: items, error: itemsErr } = await supabaseServer
      .from('order_items')
      .select(`
        quantity, unit_price, total,
        product:product_id(name),
        size:size_id(label)
      `)
      .eq('order_id', orderId);

    if (itemsErr || !items) {
      console.error('Error fetching items for email:', itemsErr);
      return;
    }

    const itemsListHtml = items.map((i: any) => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.08);">
        <td style="padding: 12px 0; color: #f0f0f0;">
          <strong>${i.product?.name || 'Sneaker'}</strong>
          ${i.size?.label ? `<span style="color: rgba(255,255,255,0.5); font-size: 13px;"> (Tamanho: ${i.size.label})</span>` : ''}
        </td>
        <td style="padding: 12px 0; text-align: center; color: rgba(255,255,255,0.7);">${i.quantity}x</td>
        <td style="padding: 12px 0; text-align: right; color: #00f0ff; font-weight: bold; font-family: 'Courier New', monospace;">
          R$ ${Number(i.unit_price).toFixed(2).replace('.', ',')}
        </td>
      </tr>
    `).join('');

    const formattedTotal = Number(order.total).toFixed(2).replace('.', ',');
    const customerCpf = profile.cpf ? profile.cpf.replace(/\D/g, '') : '';
    const loginInstructions = customerCpf
      ? `
        <div style="background: rgba(0, 240, 255, 0.04); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 12px; padding: 20px; margin-top: 30px; text-align: left;">
          <h3 style="color: #00f0ff; margin-top: 0; font-family: 'Orbitron', Arial, sans-serif; font-size: 16px; letter-spacing: 1px;">SUA CONTA FOI CRIADA</h3>
          <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 1.5; color: rgba(255,255,255,0.8);">
            Acesse o painel para acompanhar o andamento da entrega e ver seu histórico.
          </p>
          <div style="font-size: 13px; color: rgba(255,255,255,0.6);">
            <strong style="color: #fff;">E-mail:</strong> ${email}<br />
            <strong style="color: #fff;">Senha padrão:</strong> ${customerCpf} <span style="font-size: 11px; color: rgba(255,255,255,0.4);">(seus 11 dígitos do CPF)</span>
          </div>
          <div style="margin-top: 16px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: linear-gradient(135deg, #00f0ff, #8b5cf6); color: #0a0a0f; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-weight: bold; font-size: 13px; font-family: 'Orbitron', Arial, sans-serif; letter-spacing: 1px;">ENTRAR NO SISTEMA</a>
          </div>
        </div>
      `
      : '';

    const address = order.address as any;
    const addressHtml = address
      ? `
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.7);">
          ${address.street}, ${address.number} ${address.complement ? `- ${address.complement}` : ''}<br />
          ${address.neighborhood} - ${address.city}/${address.state}<br />
          CEP: ${address.zip_code}
        </p>
      `
      : '<p style="margin:0; color: rgba(255,255,255,0.5);">Endereço não disponível</p>';

    // Beautiful Responsive HTML template matching the website theme
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Pedido Confirmado - ALL Shops</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #0a0a0f; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f0f0f0;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a0a0f; table-layout: fixed;">
          <tr>
            <td align="center" style="padding: 40px 10px;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #12121a; border: 1px solid rgba(255,255,255,0.06); border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                <!-- Header/Logo -->
                <tr>
                  <td align="center" style="padding: 40px 20px; background: linear-gradient(180deg, rgba(0,240,255,0.06), transparent); border-bottom: 1px solid rgba(255,255,255,0.04);">
                    <img src="https://cjxmynoimzpomynhyiwq.supabase.co/storage/v1/object/public/product-images/AEL.png" alt="ALL Shops" style="height: 60px; margin-bottom: 12px; display: block;" />
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 20px; font-weight: bold; letter-spacing: 4px; color: #00f0ff;">SHOPS</span>
                  </td>
                </tr>
                
                <!-- Hero Body -->
                <tr>
                  <td style="padding: 40px 30px;">
                    <h1 style="margin: 0 0 16px 0; color: #f0f0f0; text-align: center; font-size: 24px; font-weight: 700; letter-spacing: 1px;">PEDIDO CONFIRMADO!</h1>
                    <p style="margin: 0 0 30px 0; text-align: center; font-size: 15px; color: rgba(255,255,255,0.6); line-height: 1.6;">
                      Olá, <strong>${profile.name}</strong>. Obrigado por comprar na ALL Shops! Seu pagamento foi aprovado e seu pedido <strong>#${orderId}</strong> já está sendo preparado para o envio.
                    </p>
                    
                    <!-- Items Grid -->
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 30px; border-collapse: collapse;">
                      <thead>
                        <tr style="border-bottom: 2px solid rgba(255,255,255,0.1);">
                          <th align="left" style="padding-bottom: 8px; color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 1px;">PRODUTO</th>
                          <th align="center" style="padding-bottom: 8px; color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 1px; width: 60px;">QTD</th>
                          <th align="right" style="padding-bottom: 8px; color: rgba(255,255,255,0.4); font-size: 12px; letter-spacing: 1px; width: 100px;">VALOR</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsListHtml}
                      </tbody>
                      <tfoot>
                        <tr>
                          <td colspan="2" style="padding: 20px 0 10px 0; font-weight: bold; color: rgba(255,255,255,0.7); font-size: 15px;">TOTAL</td>
                          <td align="right" style="padding: 20px 0 10px 0; font-size: 18px; font-weight: bold; color: #ff00aa; font-family: 'Courier New', monospace;">
                            R$ ${formattedTotal}
                          </td>
                        </tr>
                      </tfoot>
                    </table>

                    <!-- Address Box -->
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                      <h3 style="margin: 0 0 10px 0; font-size: 14px; color: rgba(255,255,255,0.5); letter-spacing: 1px;">ENDEREÇO DE ENTREGA</h3>
                      ${addressHtml}
                    </div>

                    <!-- Login Info Card -->
                    ${loginInstructions}
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center" style="padding: 30px 20px; background-color: #07070a; border-top: 1px solid rgba(255,255,255,0.04); font-size: 12px; color: rgba(255,255,255,0.4); line-height: 1.6;">
                    <p style="margin: 0 0 8px 0;">ALL Shops Premium Sneakers & Atitude</p>
                    <p style="margin: 0;">Você recebeu este e-mail porque realizou uma compra em nosso site.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const textContent = `
      Pedido Confirmado - ALL Shops
      
      Olá ${profile.name}, seu pedido #${orderId} foi confirmado e está sendo preparado!
      
      Itens do pedido:
      ${items.map((i: any) => `- ${i.product?.name} (Qtd: ${i.quantity}) - R$ ${Number(i.unit_price).toFixed(2).replace('.', ',')}`).join('\n')}
      
      Total: R$ ${formattedTotal}
      
      Endereço de Entrega:
      ${address ? `${address.street}, ${address.number} - ${address.neighborhood}, ${address.city}/${address.state}` : ''}
      
      ${customerCpf ? `Sua conta foi criada! Acesse com seu email e utilize o CPF ${customerCpf} como senha padrão.` : ''}
    `;

    // 5. Send email
    await transporter.sendMail({
      from: '"ALL Shops" <b139eb001@smtp-brevo.com>',
      to: email,
      subject: `Pedido Confirmado #${orderId} - ALL Shops`,
      text: textContent,
      html: htmlContent,
    });

    console.log(`Email sent successfully for order #${orderId}`);
  } catch (error) {
    console.error('Error sending order email:', error);
  }
}
