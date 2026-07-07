import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const supabase = createClient(
  'https://cjxmynoimzpomynhyiwq.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Load the source product data (eval the TS file - it's just a default export)
const productsPath = resolve(__dirname, '..', 'src', 'data', 'products.ts');
const tsContent = readFileSync(productsPath, 'utf-8');
const dataMatch = tsContent.match(/const products: Product\[\] = (\[[\s\S]*?\]);/);
if (!dataMatch) { console.error('Could not parse products data'); process.exit(1); }

// Safer: read the raw product names/descriptions we know exist
// Actually let's just use inline correct data from the source file
const correctData = {
  descriptions: {
    1: 'O <strong>On Running Cloudtilt Black Ivory</strong> combina tecnologia suíça de amortecimento com um design sofisticado e moderno. Perfeito para quem busca conforto durante longas caminhadas sem abrir mão do estilo.',
    2: 'O <strong>Nike Dunk Low "Cacao Wow"</strong> traz um design único e saboroso, inspirado na riqueza das cores do cacau. Com uma combinação de tons quentes e texturas sofisticadas, esse modelo oferece um estilo ousado e versátil.',
    3: 'O <strong>Slide Nike Mind 001 Black Chrome</strong> é a combinação perfeita de conforto e estilo moderno. Design minimalista com acabamento premium para uso casual.',
    4: 'O clássico <strong>Nike Air Force 1 Triple White</strong> dispensa apresentações. O tênis que transcende gerações, agora no seu guarda-roupa com a qualidade premium que você merece.',
    5: 'O <strong>Nike Air Force 1 \'07 Black</strong> é a versão escura do clássico mundialmente conhecido. Imponente, elegante e versátil para qualquer ocasião.',
    6: 'O <strong>Slide Nike Mind 001 Solar Red</strong> traz um toque vibrante ao seu visual com a cor Solar Red. Conforto e estilo em um só produto.',
    7: 'O <strong>Slide Nike Mind 001 Light Bone</strong> traz um tom neutro e sofisticado para o seu visual. Minimalista, elegante e extremamente confortável.',
    8: 'O <strong>Nike Vomero Premium Black Volt</strong> oferece o máximo em amortecimento para corridas e uso diário. Tecnologia de ponta com estilo marcante.',
    9: 'O <strong>Nike Air Max 97 Triple White</strong> é um clássico absoluto! Design icônico com aquele visual clean e versátil. O amortecimento Air Max oferece conforto superior.',
    10: 'O <strong>Nike Air Max 95 Essential Triple Black</strong> é um clássico que não sai de moda. Design marcante com camadas sobrepostas e amortecimento Air Max visível.',
  },
  features: {
    1: ['Amortecimento CloudTec® para impacto suave', 'Cabedal em material respirável de alta qualidade', 'Solado de borracha com tração avançada', 'Design premium preto com detalhes em ivory', 'Palmilha moldada para suporte adicional'],
    2: ['Amortecimento Nike Zoom para conforto superior', 'Cabedal em couro premium e camurça', 'Solado de borracha com padrão de tração', 'Colorway "Cacao Wow" com tons de marrom e bege', 'Design clássico do Dunk Low'],
    3: ['Material sintético premium resistente à água', 'Entressola em EVA para amortecimento leve', 'Design moderno e sofisticado', 'Solado emborrachado antiderrapante', 'Ideal para uso diário'],
    4: ['Amortecimento Nike Air no calcanhar', 'Cabedal em couro legítimo branco', 'Design clássico e atemporal', 'Solado de borracha durável', 'Perfurações no bico para respirabilidade'],
    5: ['Amortecimento Nike Air no calcanhar', 'Cabedal em couro legítimo preto', 'Design clássico e versátil', 'Solado de borracha durável', 'Perfurações no bico para respirabilidade'],
    6: ['Material sintético premium resistente', 'Entressola em EVA para amortecimento', 'Design moderno com cor vibrante Solar Red', 'Solado emborrachado antiderrapante', 'Ideal para uso diário'],
    7: ['Material sintético premium resistente', 'Entressola em EVA para amortecimento', 'Design minimalista na cor Light Bone', 'Solado emborrachado antiderrapante', 'Ideal para uso diário'],
    8: ['Amortecimento ZoomX de alto retorno de energia', 'Cabedal em mesh respirável premium', 'Design moderno com detalhes Volt', 'Solado de borracha com padrão de tração', 'Palmilha acolchoada para conforto extra'],
    9: ['Amortecimento Air Max de percurso total', 'Cabedal em couro e mesh', 'Design icônico com linhas fluidas', 'Solado de borracha durável', 'Visual triple white versátil'],
    10: ['Amortecimento Air Max no calcanhar e antepé', 'Cabedal em couro, mesh e sintético', 'Design icônico de camadas sobrepostas', 'Solado de borracha com tração', 'Visual triple black sofisticado'],
  },
  names: {
    1: 'On Running Cloudtilt Black Ivory',
    2: 'Tênis Dunk Low "Cacao Wow"',
    3: 'Slide Nike Mind 001 Black Chrome',
    4: 'Nike Air Force 1 Triple White',
    5: 'Nike Air Force 1 \'07 Black',
    6: 'Slide Nike Mind 001 Solar Red',
    7: 'Slide Nike Mind 001 Light Bone',
    8: 'Nike Vomero Premium Black Volt',
    9: 'Nike Air Max 97 Triple White',
    10: 'Nike Air Max 95 Essential Triple Black',
  },
  reviews: {
    1: { name: 'Carlos Mendes', text: 'Estou muito satisfeito com o On Running Cloudtilt Black Ivory. O conforto surpreende desde o primeiro uso, o amortecimento é excelente para caminhar o dia todo e o acabamento é impecável.' },
    2: { name: 'Ana Paula', text: 'Produto incrível! Conforto e estilo andam juntos nesse modelo. Superou minhas expectativas.' },
    3: { name: 'Fernanda Silva', text: 'O Dunk Low Cacao Wow é simplesmente lindo! A cor é exatamente como esperava, o design é clássico e versátil.' },
    4: { name: 'Lucas Oliveira', text: 'Conforto e estilo impecáveis. Material de primeira qualidade.' },
    5: { name: 'André Oliveira', text: 'O Slide Nike Mind 001 Black Chrome é muito confortável e elegante. Design moderno e sofisticado.' },
    6: { name: 'Rafael Santos', text: 'Clássico absoluto. Não tem como errar com um Air Force 1 Triple White.' },
    7: { name: 'Pedro Almeida', text: 'Preto é elegância pura. Tênis maravilhoso e confortável.' },
    8: { name: 'Marina Costa', text: 'Cor linda e muito confortável. Perfeito para o dia a dia.' },
    9: { name: 'Isabela Martins', text: 'O Slide Nike Mind 001 Light Bone Bege é muito confortável e elegante! Design minimalista e sofisticado.' },
    10: { name: 'Thiago Lima', text: 'Amortecimento sensacional! Parece que estou pisando em nuvens.' },
    11: { name: 'Camila Alves', text: 'O Nike Air Max 97 Triple White é um clássico absoluto! Design icônico com aquele visual clean e versátil.' },
    12: { name: 'Lucas Pereira', text: 'O Nike Air Max 95 Essential Triple Black é um clássico que não sai de moda. Design incrível.' },
  }
};

async function main() {
  console.log('Fixing products...');
  for (const [id, description] of Object.entries(correctData.descriptions)) {
    const { error } = await supabase
      .from('products')
      .update({ description })
      .eq('id', Number(id));
    if (error) console.error(`  Product ${id} description:`, error.message);
    else console.log(`  Product ${id} description OK`);
  }

  console.log('\nFixing features...');
  for (const [id, features] of Object.entries(correctData.features)) {
    const { error } = await supabase
      .from('products')
      .update({ features })
      .eq('id', Number(id));
    if (error) console.error(`  Product ${id} features:`, error.message);
    else console.log(`  Product ${id} features OK`);
  }

  console.log('\nFixing product names...');
  for (const [id, name] of Object.entries(correctData.names)) {
    const { error } = await supabase
      .from('products')
      .update({ name })
      .eq('id', Number(id));
    if (error) console.error(`  Product ${id} name:`, error.message);
    else console.log(`  Product ${id} name OK`);
  }

  console.log('\nFixing category Tênis...');
  const { error: catErr } = await supabase
    .from('categories')
    .update({ name: 'Tênis' })
    .eq('name', 'Tênis');
  if (catErr && catErr.code !== 'PGRST116') {
    // Also try by id
    const { error: catErr2 } = await supabase
      .from('categories')
      .update({ name: 'Tênis' })
      .eq('id', 1);
    if (catErr2) console.error('  Category fix:', catErr2.message);
    else console.log('  Category Tênis OK');
  } else {
    console.log('  Category Tênis OK');
  }

  console.log('\nFixing reviews...');
  for (const [id, review] of Object.entries(correctData.reviews)) {
    const { error } = await supabase
      .from('product_reviews')
      .update({ name: review.name, text: review.text })
      .eq('id', Number(id));
    if (error) console.error(`  Review ${id}:`, error.message);
    else console.log(`  Review ${id} OK`);
  }

  console.log('\nDone!');
}
main().catch(console.error);
