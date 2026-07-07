# Store — Premium Streetwear

E-commerce de sneakers com Next.js (App Router), Supabase e Mercado Pago.

## Stack

- **Frontend:** Next.js 16 (App Router), TypeScript, CSS Modules
- **Backend:** Next.js API Routes + Server Components (Backend-for-Frontend)
- **Database:** Supabase (PostgreSQL) com RLS
- **Storage:** Supabase Storage (imagens dos produtos)
- **Pagamento:** Mercado Pago (Orders API / Pix)
- **Auth:** Supabase Auth (futuro)

## Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`

## Testando o Checkout

### Credenciais de teste (Mercado Pago)

| Chave | Valor |
|-------|-------|
| Public Key | `APP_USR-d64bbf0b-15a7-49ec-84f9-44d890e3615b` |
| Access Token | `APP_USR-4388262351512538-070704-eb8eea180e47a224483d732aaabd082b-3525455088` |

### Usuários de teste

Os test users foram criados automaticamente ao configurar a aplicação:

| Perfil | ID |
|--------|----|
| Vendedor (Seller) | `3525455088` |
| Comprador (Buyer) | `3525648998` |

### Como testar o fluxo de pagamento (Pix)

1. Adicione produtos ao carrinho na página inicial
2. Clique em **"FINALIZAR PEDIDO"** no carrinho
3. Preencha os dados de entrega (pode usar dados fictícios)
4. Clique em **"FINALIZAR PEDIDO"**
5. Um QR Code Pix será exibido
6. **Para simular o pagamento aprovado:**
   - Copie o código Pix clicando sobre ele
   - Ou use o Mercado Pago API para simular o pagamento via test user

### Simulando pagamento aprovado via API

Para testar sem um app de banco real, use o `mercadopago_add_money_test_user` para adicionar fundos e depois faça um POST na API para simular o pagamento:

```bash
# Adicionar fundos ao test user comprador
mercadopago_add_money_test_user --test_user_id=3525648998 --amount=5000

# Criar pagamento manualmente (substitua ORDER_ID pelo ID do MP)
curl -X POST https://api.mercadopago.com/v1/payments \
  -H "Authorization: Bearer APP_USR-4388262351512538-070704-eb8eea180e47a224483d732aaabd082b-3525455088" \
  -H "Content-Type: application/json" \
  -d '{
    "transaction_amount": 100.00,
    "payment_method_id": "pix",
    "payer": { "email": "test_user_3525648998@testuser.com" }
  }'
```

### Cartões de crédito para teste (Orders API / CardPayment Brick)

| Bandeira | Número | CVV | Vencimento |
|----------|--------|-----|------------|
| Mastercard | `5031 4332 1540 6351` | 123 | 11/30 |
| Visa | `4235 6477 2802 5682` | 123 | 11/30 |
| American Express | `3753 651535 56885` | 1234 | 11/30 |

Para simular diferentes cenários de pagamento, use os dados abaixo nos campos **Nome do titular** e **CPF** do CardPayment Brick:

| Resultado | Nome do titular | CPF |
|-----------|----------------|-----|
| **Aprovado** | `APRO` | `12345678909` |
| Recusado (erro geral) | `OTHE` | `12345678909` |
| Pendente | `CONT` | - |
| Recusado (validação) | `CALL` | - |
| Recusado (saldo) | `FUND` | - |
| Recusado (CVV inválido) | `SECU` | - |

> O nome `APRO` + CPF `12345678909` sinaliza ao simulador do Mercado Pago para retornar "pagamento aprovado".

## Arquitetura

```
                     ┌──────────────────────────────────┐
                     │        Next.js (BFF)             │
                     │                                  │
  Browser ─────► Server Components ───► Supabase (read) │
             │   API Routes ──────────► Supabase (write)│
             │                        ► Mercado Pago    │
             └──────────────────────────────────────────┘
```

- **Server Components:** Buscam dados do Supabase diretamente (catálogo de produtos)
- **API Routes:** Operações com efeito colateral (criar pedido, pagar, webhooks)
- **Sem Edge Functions:** Tudo统一 no Next.js

## Schema do Banco

Tabelas: `categories`, `sizes`, `products`, `product_sizes`, `product_images`, `product_reviews`, `profiles`, `addresses`, `orders`, `order_items`, `payments`, `subscribers`

RLS ativado com políticas de leitura pública para catálogo e acesso restrito por role (`admin`/`customer`).
