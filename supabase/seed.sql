-- Seed categories
INSERT INTO categories (name, slug, image_url) VALUES
  ('Tênis', 'tenis', NULL),
  ('Dunk Low', 'dunk-low', NULL),
  ('Slide', 'slide', NULL),
  ('Air Force', 'air-force', NULL),
  ('Nike Vomero', 'nike-vomero', NULL),
  ('Air Max 97', 'air-max-97', NULL),
  ('Air Max 95', 'air-max-95', NULL)
ON CONFLICT (slug) DO NOTHING;

-- Seed products
INSERT INTO products (name, slug, brand, description, price, compare_price, features, category_id, active)
SELECT * FROM (VALUES
  ('On Running Cloudtilt Black Ivory', 'on-running-cloudtilt-black-ivory', 'On Running', E'O <strong>On Running Cloudtilt Black Ivory</strong> combina tecnologia suíça de amortecimento com um design sofisticado e moderno. Perfeito para quem busca conforto durante longas caminhadas sem abrir mão do estilo.', 985, 1299, '["Amortecimento CloudTec® para impacto suave","Cabedal em material respirável de alta qualidade","Solado de borracha com tração avançada","Design premium preto com detalhes em ivory","Palmilha moldada para suporte adicional"]'::jsonb, (SELECT id FROM categories WHERE slug = 'tenis'), true),
  ('Tênis Dunk Low "Cacao Wow"', 'tenis-dunk-low-cacao-wow', 'Nike', E'O <strong>Nike Dunk Low "Cacao Wow"</strong> traz um design único e saboroso, inspirado na riqueza das cores do cacau. Com uma combinação de tons quentes e texturas sofisticadas, esse modelo oferece um estilo ousado e versátil.', 799, 999, '["Amortecimento Nike Zoom para conforto superior","Cabedal em couro premium e camurça","Solado de borracha com padrão de tração","Colorway \"Cacao Wow\" com tons de marrom e bege","Design clássico do Dunk Low"]'::jsonb, (SELECT id FROM categories WHERE slug = 'dunk-low'), true),
  ('Slide Nike Mind 001 Black Chrome', 'slide-nike-mind-001-black-chrome', 'Nike', E'O <strong>Slide Nike Mind 001 Black Chrome</strong> é a combinação perfeita de conforto e estilo moderno. Design minimalista com acabamento premium para uso casual.', 949, 1199, '["Material sintético premium resistente à água","Entressola em EVA para amortecimento leve","Design moderno e sofisticado","Solado emborrachado antiderrapante","Ideal para uso diário"]'::jsonb, (SELECT id FROM categories WHERE slug = 'slide'), true),
  ('Nike Air Force 1 Triple White', 'nike-air-force-1-triple-white', 'Nike', E'O clássico <strong>Nike Air Force 1 Triple White</strong> dispensa apresentações. O tênis que transcende gerações, agora no seu guarda-roupa com a qualidade premium que você merece.', 985, 1299, '["Amortecimento Nike Air no calcanhar","Cabedal em couro legítimo branco","Design clássico e atemporal","Solado de borracha durável","Perfurações no bico para respirabilidade"]'::jsonb, (SELECT id FROM categories WHERE slug = 'air-force'), true),
  ('Nike Air Force 1 ''07 Black', 'nike-air-force-1-07-black', 'Nike', E'O <strong>Nike Air Force 1 "07 Black</strong> é a versão escura do clássico mundialmente conhecido. Imponente, elegante e versátil para qualquer ocasião.', 799, 1099, '["Amortecimento Nike Air no calcanhar","Cabedal em couro legítimo preto","Design clássico e versátil","Solado de borracha durável","Perfurações no bico para respirabilidade"]'::jsonb, (SELECT id FROM categories WHERE slug = 'air-force'), true),
  ('Slide Nike Mind 001 Solar Red', 'slide-nike-mind-001-solar-red', 'Nike', E'O <strong>Slide Nike Mind 001 Solar Red</strong> traz um toque vibrante ao seu visual com a cor Solar Red. Conforto e estilo em um só produto.', 949, 1199, '["Material sintético premium resistente","Entressola em EVA para amortecimento","Design moderno com cor vibrante Solar Red","Solado emborrachado antiderrapante","Ideal para uso diário"]'::jsonb, (SELECT id FROM categories WHERE slug = 'slide'), true),
  ('Slide Nike Mind 001 Light Bone', 'slide-nike-mind-001-light-bone', 'Nike', E'O <strong>Slide Nike Mind 001 Light Bone</strong> traz um tom neutro e sofisticado para o seu visual. Minimalista, elegante e extremamente confortável.', 949, 1199, '["Material sintético premium resistente","Entressola em EVA para amortecimento","Design minimalista na cor Light Bone","Solado emborrachado antiderrapante","Ideal para uso diário"]'::jsonb, (SELECT id FROM categories WHERE slug = 'slide'), true),
  ('Nike Vomero Premium Black Volt', 'nike-vomero-premium-black-volt', 'Nike', E'O <strong>Nike Vomero Premium Black Volt</strong> oferece o máximo em amortecimento para corridas e uso diário. Tecnologia de ponta com estilo marcante.', 1199, 1399, '["Amortecimento ZoomX de alto retorno de energia","Cabedal em mesh respirável premium","Design moderno com detalhes Volt","Solado de borracha com padrão de tração","Palmilha acolchoada para conforto extra"]'::jsonb, (SELECT id FROM categories WHERE slug = 'nike-vomero'), true),
  ('Nike Air Max 97 Triple White', 'nike-air-max-97-triple-white', 'Nike', E'O <strong>Nike Air Max 97 Triple White</strong> é um clássico absoluto! Design icônico com aquele visual clean e versátil. O amortecimento Air Max oferece conforto superior.', 1099, 1399, '["Amortecimento Air Max de percurso total","Cabedal em couro e mesh","Design icônico com linhas fluidas","Solado de borracha durável","Visual triple white versátil"]'::jsonb, (SELECT id FROM categories WHERE slug = 'air-max-97'), true),
  ('Nike Air Max 95 Essential Triple Black', 'nike-air-max-95-essential-triple-black', 'Nike', E'O <strong>Nike Air Max 95 Essential Triple Black</strong> é um clássico que não sai de moda. Design marcante com camadas sobrepostas e amortecimento Air Max visível.', 899, 1199, '["Amortecimento Air Max no calcanhar e antepé","Cabedal em couro, mesh e sintético","Design icônico de camadas sobrepostas","Solado de borracha com tração","Visual triple black sofisticado"]'::jsonb, (SELECT id FROM categories WHERE slug = 'air-max-95'), true)
) AS v(name, slug, brand, description, price, compare_price, features, category_id, active)
WHERE NOT EXISTS (SELECT 1 FROM products p WHERE p.slug = v.slug);

-- Seed product images
DO $$
DECLARE
  p RECORD;
  base_url TEXT := 'https://cjxmynoimzpomynhyiwq.supabase.co/storage/v1/object/public/product-images';
  img_map TEXT[][];
  img_row TEXT[];
BEGIN
  img_map := ARRAY[
    ARRAY['on-running-cloudtilt-black-ivory', 'product_1.png'],
    ARRAY['tenis-dunk-low-cacao-wow', 'product_2.png'],
    ARRAY['slide-nike-mind-001-black-chrome', 'product_3.webp'],
    ARRAY['nike-air-force-1-triple-white', 'product_4.png'],
    ARRAY['nike-air-force-1-07-black', 'product_5.png'],
    ARRAY['slide-nike-mind-001-solar-red', 'product_6.webp'],
    ARRAY['slide-nike-mind-001-light-bone', 'product_7.webp'],
    ARRAY['nike-vomero-premium-black-volt', 'product_8.webp'],
    ARRAY['nike-air-max-97-triple-white', 'product_9.png'],
    ARRAY['nike-air-max-95-essential-triple-black', 'product_10.png']
  ];

  FOREACH img_row SLICE 1 IN ARRAY img_map
  LOOP
    SELECT id, slug INTO p FROM products WHERE slug = img_row[1];
    IF FOUND THEN
      INSERT INTO product_images (product_id, url, alt, sort_order)
      VALUES (p.id, base_url || '/' || img_row[2], p.slug, 0)
      ON CONFLICT DO NOTHING;
    END IF;
  END LOOP;
END $$;

-- Link sizes (39-42 for all products)
DO $$
DECLARE
  p RECORD;
  s RECORD;
BEGIN
  FOR p IN SELECT id FROM products LOOP
    FOR s IN SELECT id FROM sizes WHERE label IN ('39','40','41','42') LOOP
      INSERT INTO product_sizes (product_id, size_id, stock)
      VALUES (p.id, s.id, 10)
      ON CONFLICT (product_id, size_id) DO NOTHING;
    END LOOP;
  END LOOP;
END $$;

-- Seed reviews
INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Carlos Mendes', 5, 'Estou muito satisfeito com o On Running Cloudtilt Black Ivory. O conforto surpreende desde o primeiro uso, o amortecimento é excelente para caminhar o dia todo e o acabamento é impecável.'
FROM products p WHERE p.slug = 'on-running-cloudtilt-black-ivory';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Ana Paula', 5, 'Produto incrível! Conforto e estilo andam juntos nesse modelo. Superou minhas expectativas.'
FROM products p WHERE p.slug = 'on-running-cloudtilt-black-ivory';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Fernanda Silva', 5, 'O Dunk Low Cacao Wow é simplesmente lindo! A cor é exatamente como esperava, o design é clássico e versátil.'
FROM products p WHERE p.slug = 'tenis-dunk-low-cacao-wow';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Lucas Oliveira', 5, 'Conforto e estilo impecáveis. Material de primeira qualidade.'
FROM products p WHERE p.slug = 'tenis-dunk-low-cacao-wow';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'André Oliveira', 5, 'O Slide Nike Mind 001 Black Chrome é muito confortável e elegante. Design moderno e sofisticado.'
FROM products p WHERE p.slug = 'slide-nike-mind-001-black-chrome';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Rafael Santos', 5, 'Clássico absoluto. Não tem como errar com um Air Force 1 Triple White.'
FROM products p WHERE p.slug = 'nike-air-force-1-triple-white';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Pedro Almeida', 5, 'Preto é elegância pura. Tênis maravilhoso e confortável.'
FROM products p WHERE p.slug = 'nike-air-force-1-07-black';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Marina Costa', 5, 'Cor linda e muito confortável. Perfeito para o dia a dia.'
FROM products p WHERE p.slug = 'slide-nike-mind-001-solar-red';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Isabela Martins', 5, 'O Slide Nike Mind 001 Light Bone Bege é muito confortável e elegante! Design minimalista e sofisticado.'
FROM products p WHERE p.slug = 'slide-nike-mind-001-light-bone';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Thiago Lima', 5, 'Amortecimento sensacional! Parece que estou pisando em nuvens.'
FROM products p WHERE p.slug = 'nike-vomero-premium-black-volt';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Camila Alves', 5, 'O Nike Air Max 97 Triple White é um clássico absoluto! Design icônico com aquele visual clean e versátil.'
FROM products p WHERE p.slug = 'nike-air-max-97-triple-white';

INSERT INTO product_reviews (product_id, name, rating, text)
SELECT p.id, 'Lucas Pereira', 5, 'O Nike Air Max 95 Essential Triple Black é um clássico que não sai de moda. Design incrível.'
FROM products p WHERE p.slug = 'nike-air-max-95-essential-triple-black';
