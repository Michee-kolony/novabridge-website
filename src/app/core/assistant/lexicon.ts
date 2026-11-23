/**
 * Lexique multilingue de l'assistant (anglais, français, espagnol, portugais, chinois).
 * Chaque concept regroupe les mots et expressions qui l'évoquent, quelle que soit la langue
 * de l'utilisateur : « gants », « gloves », « guantes », « luvas », « 手套 » → même concept.
 *
 * ✏️ Pour améliorer la compréhension : ajoutez simplement des mots dans les listes ci-dessous
 * (sans accents ni majuscules ; les fautes de frappe légères sont tolérées automatiquement).
 */

export type Intent =
  | 'greeting' | 'thanks' | 'bye' | 'bot' | 'howareyou'
  | 'price' | 'quote' | 'moq' | 'branding' | 'leadtime' | 'shipping' | 'ddp' | 'payment' | 'quality'
  | 'countries' | 'languages' | 'contact' | 'location' | 'about' | 'factory' | 'human' | 'sample'
  | 'catalog' | 'products' | 'news' | 'process' | 'savings' | 'order' | 'yes' | 'no';

/** Intentions « conversationnelles » : elles ne priment que s'il n'y a pas de vraie question. */
export const SMALL_TALK: Intent[] = ['greeting', 'thanks', 'bye', 'howareyou', 'yes', 'no'];

/** Ordre de priorité quand plusieurs intentions sont détectées dans le même message. */
export const INTENT_PRIORITY: Intent[] = [
  'human', 'quote', 'order', 'price', 'moq', 'branding', 'sample', 'leadtime', 'ddp', 'shipping', 'payment', 'quality',
  'catalog', 'process', 'savings', 'countries', 'languages', 'contact', 'location', 'factory', 'about', 'news', 'products', 'bot',
  'howareyou', 'greeting', 'thanks', 'bye', 'yes', 'no',
];

export const INTENTS: Record<Intent, string[]> = {
  greeting: ['hello', 'hi', 'hey', 'hiya', 'good morning', 'good afternoon', 'good evening', 'bonjour', 'salut', 'bonsoir', 'coucou', 'hola', 'buenos dias', 'buenas tardes', 'buenas', 'ola', 'oi', 'bom dia', 'boa tarde', 'boa noite', '你好', '您好', '嗨', 'yo'],
  thanks: ['thanks', 'thank you', 'thx', 'ty', 'merci', 'gracias', 'obrigado', 'obrigada', '谢谢', '感谢', 'great', 'perfect', 'parfait', 'super', 'genial', 'perfecto', 'perfeito', 'top', 'cool'],
  bye: ['bye', 'goodbye', 'see you', 'au revoir', 'a bientot', 'a plus', 'bonne journee', 'adios', 'hasta luego', 'tchau', 'ate logo', '再见', '拜拜'],
  howareyou: ['how are you', 'how r u', 'ca va', 'comment vas tu', 'comment allez vous', 'como estas', 'que tal', 'como vai', 'tudo bem', '你好吗'],
  bot: ['are you a bot', 'are you human', 'robot', 'chatbot', 'artificial', 'who are you', 'what are you', 'es tu un robot', 'qui es tu', 'tu es qui', 'eres un robot', 'quien eres', 'voce e um robo', 'quem e voce', '机器人', '你是谁'],
  yes: ['yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'oui', 'ouais', 'd accord', 'si', 'claro', 'sim', 'pode ser', '是', '好的', '可以'],
  no: ['no', 'nope', 'non', 'nao', 'pas maintenant', 'not now', '不', '不用'],

  price: ['price', 'prices', 'pricing', 'cost', 'costs', 'how much', 'rate', 'rates', 'tariff', 'prix', 'tarif', 'tarifs', 'combien coute', 'combien coutent', 'combien ca coute', 'a combien', 'cout', 'coute', 'coutent', 'precio', 'precios', 'cuanto cuesta', 'cuanto cuestan', 'cuanto vale', 'costo', 'preco', 'precos', 'quanto custa', 'quanto custam', 'custo', '价格', '多少钱', '费用', '价钱', '单价', 'cheap', 'cheaper', 'expensive', 'discount', 'remise', 'reduction', 'pas cher', 'cher', 'descuento', 'barato', 'desconto', 'caro', '便宜', '折扣', 'budget', 'presupuesto', 'orcamento', 'usd', 'dollar', 'dollars', 'euro', 'euros', '$'],
  quote: ['quote', 'quotation', 'estimate', 'proforma', 'devis', 'cotation', 'cotizacion', 'cotizar', 'presupuesto', 'orcamento', 'cotacao', '报价', '询价', '报价单', 'rfq'],
  order: ['order', 'place an order', 'buy', 'purchase', 'i want to order', 'commander', 'commande', 'acheter', 'passer commande', 'pedido', 'comprar', 'hacer un pedido', 'encomenda', 'encomendar', 'fazer um pedido', '下单', '订购', '购买', '订单'],
  moq: ['moq', 'minimum', 'minimum order', 'min order', 'minimal', 'small order', 'small quantity', 'how many units', 'quantite minimale', 'quantite minimum', 'commande minimum', 'minimum de commande', 'petite quantite', 'petite commande', 'cantidad minima', 'pedido minimo', 'pocas unidades', 'quantidade minima', 'pedido minimo', 'poucas unidades', '起订量', '最小起订', '最低起订', '最少', 'quantity', 'quantite', 'cantidad', 'quantidade', '数量'],
  branding: ['logo', 'logos', 'branding', 'branded', 'brand', 'custom', 'customize', 'customise', 'customized', 'personalize', 'personalized', 'print', 'printing', 'embroidery', 'personnaliser', 'personnalise', 'personnalisation', 'marquage', 'impression', 'broderie', 'personalizar', 'personalizado', 'personalizacion', 'estampado', 'bordado', 'personalizacao', 'impressao', '定制', '印刷', '刺绣', '品牌', 'private label', 'white label', 'oem', 'marque blanche', 'marque propre', 'marca propia', 'marca propria', '贴牌', 'mock-up', 'mockup', 'mock up', 'maquette', 'design', 'colors', 'couleurs', 'colores', 'cores', '颜色'],
  sample: ['sample', 'samples', 'prototype', 'echantillon', 'echantillons', 'muestra', 'muestras', 'amostra', 'amostras', '样品', '打样', 'test order', 'commande test'],
  leadtime: ['lead time', 'leadtime', 'how long', 'how many weeks', 'how many days', 'turnaround', 'production time', 'timeline', 'when will', 'how fast', 'delai', 'delais', 'combien de temps', 'en combien de temps', 'quand', 'rapidement', 'semaines', 'plazo', 'plazos', 'cuanto tiempo', 'cuando', 'semanas', 'prazo', 'prazos', 'quanto tempo', 'quando', '交期', '多久', '多长时间', '生产时间', '几周', 'weeks', 'days', 'jours', 'dias', 'urgent', 'urgente', 'asap', '紧急', 'deadline'],
  shipping: ['shipping', 'ship', 'ships', 'shipment', 'delivery', 'deliver', 'delivered', 'freight', 'transport', 'logistics', 'courier', 'livraison', 'livrer', 'livrez', 'expedition', 'expedier', 'envoi', 'fret', 'transporteur', 'envio', 'enviar', 'entrega', 'entregar', 'flete', 'frete', 'transportadora', 'remessa', '运输', '发货', '物流', '送货', '运费', '海运', '空运', '快递', 'dhl', 'fedex', 'ups', 'express', 'sea freight', 'air freight', 'maritime', 'aerien', 'bateau', 'avion', 'maritimo', 'aereo', 'barco', 'navio', 'container', 'conteneur', 'contenedor', 'tracking', 'suivi', 'seguimiento', 'rastreamento'],
  ddp: ['ddp', 'customs', 'duties', 'duty', 'import tax', 'tariffs', 'douane', 'douanes', 'droits de douane', 'dedouanement', 'aduana', 'aranceles', 'impuestos', 'alfandega', 'impostos', 'desembaraco', '关税', '清关', '海关', 'incoterm', 'incoterms', 'door to door', 'porte a porte', 'puerta a puerta', 'porta a porta'],
  payment: ['pay', 'payment', 'payments', 'deposit', 'balance', 'invoice', 'wire', 'bank transfer', 'credit card', 'paypal', 'terms', 'paiement', 'payer', 'acompte', 'solde', 'facture', 'virement', 'carte bancaire', 'pago', 'pagar', 'deposito', 'anticipo', 'factura', 'transferencia', 'pagamento', 'sinal', 'fatura', '付款', '支付', '定金', '尾款', '发票', '转账'],
  quality: ['quality', 'qc', 'inspection', 'inspect', 'control', 'certified', 'certification', 'certificate', 'standard', 'standards', 'compliance', 'iso', 'ansi', 'en 388', 'fda', 'qualite', 'controle', 'certifie', 'certificat', 'norme', 'normes', 'conforme', 'calidad', 'certificado', 'normas', 'qualidade', 'controlo', '质量', '质检', '认证', '检验', 'photos', 'defect', 'defaut', 'defecto', 'defeito', 'warranty', 'garantie', 'garantia', 'guarantee'],
  countries: ['country', 'countries', 'which countries', 'worldwide', 'international', 'where do you deliver', 'where do you ship', 'quels pays', 'quel pays', 'ou livrez', 'pais', 'paises', 'que paises', 'onde', 'quais paises', '国家', '哪些国家', '哪里', 'markets', 'marches', 'mercados', '市场'],
  languages: ['language', 'languages', 'speak', 'english', 'french', 'chinese', 'spanish', 'portuguese', 'langue', 'langues', 'parlez', 'anglais', 'francais', 'chinois', 'idioma', 'idiomas', 'hablan', 'ingles', 'frances', 'chino', 'lingua', 'linguas', 'falam', 'chines', '语言', '中文', '英语', '法语'],
  contact: ['contact', 'reach', 'call', 'phone', 'telephone', 'number', 'email', 'e-mail', 'mail', 'whatsapp', 'write to', 'joindre', 'contacter', 'appeler', 'numero', 'courriel', 'ecrire', 'llamar', 'telefono', 'correo', 'contactar', 'escribir', 'ligar', 'telefone', 'escrever', '电话', '邮箱', '联系', '联络', 'hours', 'opening hours', 'horaires', 'horario', '营业时间'],
  location: ['address', 'located', 'location', 'office', 'offices', 'headquarters', 'hq', 'where are you', 'based', 'adresse', 'situe', 'situes', 'siege', 'bureau', 'bureaux', 'ou etes vous', 'direccion', 'ubicacion', 'oficina', 'donde estan', 'endereco', 'localizacao', 'escritorio', 'sede', 'onde estao', '地址', '位置', '总部', '办公室', 'austin', 'texas'],
  about: ['about', 'about you', 'company', 'who is novabridge', 'novabridge', 'history', 'mission', 'vision', 'values', 'entreprise', 'societe', 'qui etes vous', 'a propos', 'histoire', 'valeurs', 'empresa', 'quienes son', 'quienes somos', 'historia', 'valores', 'quem sao', 'sobre', '公司', '关于', '介绍', 'trust', 'reliable', 'confiance', 'fiable', 'confianza', 'confiavel', 'legit', 'serieux'],
  factory: ['factory', 'factories', 'manufacturer', 'manufacturing', 'supplier', 'suppliers', 'made in', 'usine', 'usines', 'fabricant', 'fabrication', 'fournisseur', 'fabrique', 'fabrica', 'fabricas', 'fabricante', 'proveedor', 'fornecedor', '工厂', '制造', '供应商', '生产', 'shenzhen', 'yiwu', 'jiangsu', 'zhuji', 'zhejiang', 'china', 'chine', 'chinois', '中国', 'sourcing', 'approvisionnement', 'abastecimiento', 'aprovisionamiento', 'abastecimento', '采购', 'hub', 'hubs'],
  human: ['human', 'agent', 'real person', 'someone', 'representative', 'sales rep', 'salesperson', 'talk to', 'speak to', 'speak with', 'advisor', 'humain', 'conseiller', 'commercial', 'quelqu un', 'une personne', 'parler a', 'un vrai', 'humano', 'asesor', 'vendedor', 'una persona', 'hablar con', 'pessoa', 'atendente', 'consultor', 'falar com', '人工', '客服', '销售', '真人', 'callback', 'rappel', 'rappeler'],
  catalog: ['catalog', 'catalogue', 'brochure', 'portfolio', 'pdf', 'price list', 'catalogo', 'folleto', 'lista de precios', 'lista de precos', 'grille tarifaire', '目录', '产品目录', '画册'],
  products: ['products', 'product', 'range', 'ranges', 'product lines', 'what do you sell', 'what do you offer', 'items', 'produits', 'produit', 'gamme', 'gammes', 'vendez', 'proposez', 'articles', 'productos', 'producto', 'venden', 'ofrecen', 'articulos', 'produtos', 'produto', 'vendem', 'oferecem', '产品', '商品', '卖什么', 'sell', 'offer', 'source', 'supply', 'stock', 'available', 'disponible', 'disponibles', 'disponivel', 'do you have', 'avez vous', 'tienen', 'voces tem', '有没有'],
  news: ['news', 'latest', 'announcement', 'announcements', 'blog', 'actualites', 'actualite', 'nouveautes', 'annonces', 'noticias', 'novedades', 'novidades', '新闻', '动态', '公告'],
  process: ['how does it work', 'how it works', 'process', 'steps', 'procedure', 'comment ca marche', 'comment ca fonctionne', 'fonctionnement', 'processus', 'etapes', 'como funciona', 'proceso', 'pasos', 'processo', 'etapas', '流程', '步骤', '怎么运作'],
  savings: ['save', 'savings', 'saving', 'economy', 'economiser', 'economie', 'economies', 'ahorrar', 'ahorro', 'economizar', 'economia', '节省', '省钱', 'middleman', 'middlemen', 'intermediaire', 'intermediaires', 'intermediario', 'intermediarios', '中间商'],
};

/** Gammes de produits (slug → mots qui les évoquent). Les noms et articles du catalogue s'y ajoutent automatiquement. */
export const PRODUCT_HINTS: Record<string, string[]> = {
  'entertainment-merch': ['trampoline', 'trampolines', 'trampoline park', 'playground', 'indoor playground', 'family entertainment', 'fec', 'entertainment', 'divertissement', 'loisirs', 'entretenimiento', 'entretenimento', 'wristband', 'wristbands', 'bracelet', 'bracelets', 'pulsera', 'pulseras', 'pulseira', 'pulseiras', 'balloon', 'balloons', 'ballon', 'ballons', 'globo', 'globos', 'balao', 'baloes', 'mylar', 'tattoo', 'tattoos', 'tatouage', 'tatouages', 'tatuaje', 'tatuagem', 'party', 'fete', 'anniversaire', 'fiesta', 'festa', 'cup', 'cups', 'gobelet', 'gobelets', 'vaso', 'vasos', 'copo', 'copos', 'beach towel', 'serviette de plage', 'parc de loisirs', 'aire de jeux', 'parque', '蹦床', '游乐场', '腕带', '气球', '纹身贴', 'grip socks', 'chaussettes antiderapantes', 'calcetines antideslizantes', 'meias antiderrapantes', '防滑袜'],
  'pilates-studio': ['pilates', 'yoga', 'barre', 'studio', 'studios', 'mat', 'mats', 'tapis', 'esterilla', 'esterillas', 'tapete', 'tapetes', 'legging', 'leggings', 'sports bra', 'brassiere', 'resistance band', 'bandes elastiques', 'banda elastica', 'faixa elastica', 'pilates ring', 'gym bag', 'fitness', '瑜伽', '普拉提', '瑜伽垫'],
  'ppe-safety': ['ppe', 'epi', 'epp', 'safety', 'securite', 'seguridad', 'seguranca', 'protective', 'protection', 'proteccion', 'protecao', 'glove', 'gloves', 'gant', 'gants', 'guante', 'guantes', 'luva', 'luvas', 'helmet', 'helmets', 'hard hat', 'casque', 'casques', 'casco', 'cascos', 'capacete', 'capacetes', 'boot', 'boots', 'safety shoes', 'chaussures de securite', 'bottes', 'bota', 'botas', 'vest', 'vests', 'gilet', 'gilets', 'chaleco', 'chalecos', 'colete', 'coletes', 'hi-vis', 'hi vis', 'high visibility', 'haute visibilite', 'alta visibilidad', 'alta visibilidade', 'reflective', 'reflechissant', 'reflectante', 'refletivo', 'mining', 'mines', 'minier', 'mineria', 'minero', 'mineracao', 'construction', 'chantier', 'btp', 'construccion', 'obra', 'construcao', 'oil and gas', 'petrole', 'petroleo', 'respirator', 'respirateur', 'respirador', 'harness', 'harnais', 'arnes', 'arnes de seguridad', 'cinto', 'goggles', 'safety glasses', 'lunettes', 'gafas', 'oculos', 'coverall', 'coveralls', 'combinaison', 'overol', 'macacao', 'welding', 'soudure', 'soldadura', 'solda', 'earplugs', 'ear muffs', 'bouchons d oreille', 'casque anti bruit', '劳保', '安全', '手套', '安全帽', '防护', '安全鞋', '反光背心', '矿业'],
  healthcare: ['medical', 'medicale', 'medicales', 'medicaux', 'medico', 'medica', 'medicos', 'healthcare', 'health', 'sante', 'salud', 'saude', 'scrubs', 'scrub', 'blouse', 'blouses', 'tenue medicale', 'uniforme medico', 'pijama quirurgico', 'jaleco', 'mask', 'masks', 'masque', 'masques', 'mascarilla', 'mascarillas', 'mascara', 'mascaras', 'ffp2', 'n95', 'kn95', 'nitrile', 'exam gloves', 'gants d examen', 'first aid', 'premiers secours', 'trousse de secours', 'botiquin', 'primeiros socorros', 'clinic', 'clinics', 'clinique', 'clinica', 'hospital', 'hopital', 'dental', 'dentaire', 'dentist', 'dentiste', 'dentista', 'salon', 'salons', 'nurse', 'infirmier', 'enfermera', 'enfermeira', 'consumables', 'consommables', 'consumibles', 'consumiveis', '医疗', '口罩', '手术服', '医用', '急救'],
  'apparel-uniforms': ['apparel', 'clothing', 'clothes', 'garment', 'uniform', 'uniforms', 'uniforme', 'uniformes', 'vetement', 'vetements', 'ropa', 'prendas', 'roupa', 'roupas', 'vestuario', 'hoodie', 'hoodies', 'sweat', 'sweatshirt', 'sweat a capuche', 'sudadera', 'moletom', 't-shirt', 't-shirts', 'tshirt', 'tshirts', 'tee shirt', 'tee', 'camiseta', 'camisetas', 'polo', 'polos', 'apron', 'aprons', 'tablier', 'tabliers', 'delantal', 'delantales', 'avental', 'workwear', 'vetements de travail', 'ropa de trabajo', 'roupa de trabalho', 'school uniform', 'uniforme scolaire', 'uniforme escolar', 'hotel', 'hotels', 'restaurant', 'restaurants', 'restaurante', 'spa', 'spas', 'school', 'schools', 'ecole', 'ecoles', 'escuela', 'escola', '制服', '服装', '卫衣', 't恤', '围裙', '工作服'],
  'corporate-promo': ['promo', 'promotional', 'promotion', 'promotionnel', 'promotionnels', 'promocional', 'promocionales', 'promocionais', 'corporate', 'corporate gift', 'gift', 'gifts', 'cadeau', 'cadeaux', 'cadeau d affaires', 'regalo', 'regalos', 'presente', 'brinde', 'brindes', 'goodies', 'swag', 'merch', 'merchandising', 'pen', 'pens', 'stylo', 'stylos', 'boligrafo', 'boligrafos', 'caneta', 'canetas', 'notebook', 'notebooks', 'carnet', 'carnets', 'cuaderno', 'cuadernos', 'caderno', 'cadernos', 'tote', 'tote bag', 'tote bags', 'sac', 'sacs', 'sac publicitaire', 'bolsa', 'bolsas', 'sacola', 'conference', 'conferences', 'conferencia', 'event', 'events', 'evenement', 'evenements', 'salon professionnel', 'evento', 'eventos', 'feria', 'feira', 'trade show', 'gift set', 'coffret', '礼品', '促销', '赠品', '笔', '笔记本', '帆布袋'],
};

/** Pays tels qu'enregistrés dans le formulaire de devis (valeurs anglaises) → mots qui les évoquent. */
export const COUNTRY_HINTS: Record<string, string[]> = {
  USA: ['usa', 'u.s.', 'united states', 'america', 'etats-unis', 'etats unis', 'eeuu', 'ee.uu', 'estados unidos', 'eua', '美国', 'texas', 'austin', 'dallas', 'houston', 'new york', 'california', 'florida', 'chicago', 'miami', 'los angeles'],
  Canada: ['canada', 'canadian', 'canadien', '加拿大', 'montreal', 'toronto', 'vancouver', 'quebec', 'ottawa', 'calgary'],
  Italy: ['italy', 'italie', 'italia', 'italian', '意大利', 'rome', 'roma', 'milan', 'milano'],
  France: ['france', 'francia', 'franca', '法国', 'paris', 'lyon', 'marseille'],
  Belgium: ['belgium', 'belgique', 'belgica', '比利时', 'bruxelles', 'brussels'],
  'Western Europe (other)': ['europe', 'europa', '欧洲', 'germany', 'allemagne', 'alemania', 'alemanha', 'spain', 'espagne', 'espana', 'espanha', 'portugal', 'uk', 'united kingdom', 'england', 'royaume-uni', 'reino unido', 'netherlands', 'pays-bas', 'holland', 'switzerland', 'suisse', 'suiza', 'suica', 'luxembourg', 'austria', 'autriche', 'ireland', 'irlande'],
  'DRC Congo': ['congo', 'rdc', 'drc', 'rd congo', 'kinshasa', 'lubumbashi', 'katanga', 'kolwezi', '刚果', 'brazzaville'],
  'South Africa': ['south africa', 'afrique du sud', 'sudafrica', 'africa do sul', '南非', 'johannesburg', 'durban', 'cape town', 'le cap', 'pretoria'],
  'Africa (other)': ['africa', 'afrique', 'african', 'africain', '非洲', 'cameroon', 'cameroun', 'senegal', 'nigeria', 'ivory coast', 'cote d ivoire', 'cote d\'ivoire', 'gabon', 'ghana', 'kenya', 'angola', 'mozambique', 'zambia', 'zambie', 'tanzania', 'tanzanie', 'morocco', 'maroc', 'algeria', 'algerie', 'tunisia', 'tunisie', 'mali', 'burkina', 'benin', 'togo', 'guinea', 'guinee', 'rwanda', 'burundi', 'ethiopia', 'ethiopie', 'madagascar'],
  Other: ['mexico', 'mexique', 'brazil', 'bresil', 'brasil', 'australia', 'australie', 'japan', 'japon', 'japao', 'india', 'inde', 'uae', 'dubai', 'emirats', 'saudi', 'arabie', 'argentina', 'argentine', 'chile', 'chili', 'colombia', 'colombie', 'peru', 'perou', 'haiti', 'caribbean', 'caraibes', 'caribe'],
};

/** Mots qui accompagnent une quantité (« 200 pièces », « 500 units », « 300 件 »). */
export const UNIT_WORDS = /^(k|units?|pcs|pc|pieces?|pieces|items?|pairs?|pares?|paires?|unites?|unidades?|unidade|articles?|articulos?|exemplaires?|dozens?|douzaines?|件|个|双|套|条|顶|只)$/;

/** Mots indiquant qu'on parle de la même chose que juste avant (« ça », « those », « eso »…). */
export const FOLLOW_UP = /\b(it|its|that|those|them|these|this one|ca|cela|ceux|celles|eso|esos|esas|ellos|isso|esses|essas|eles)\b|这个|那个|它们/;

/**
 * Synonymes d'articles (toutes langues) : relient un mot de la requête aux articles du catalogue
 * même si le site est affiché dans une autre langue (« gloves » ↔ « Gants », « 手套 » ↔ « Guantes »).
 */
export const ITEM_SYNONYMS: Record<string, string[]> = {
  glove: ['glove', 'gloves', 'gant', 'gants', 'guante', 'guantes', 'luva', 'luvas', '手套'],
  sock: ['sock', 'socks', 'chaussette', 'chaussettes', 'calcetin', 'calcetines', 'meia', 'meias', '袜', '袜子'],
  mask: ['mask', 'masks', 'masque', 'masques', 'mascarilla', 'mascarillas', 'mascara', 'mascaras', '口罩', '面罩'],
  helmet: ['helmet', 'helmets', 'hard hat', 'casque', 'casques', 'casco', 'cascos', 'capacete', 'capacetes', '安全帽', '头盔'],
  boot: ['boot', 'boots', 'shoe', 'shoes', 'botte', 'bottes', 'chaussure', 'chaussures', 'bota', 'botas', 'zapato', 'zapatos', 'sapato', 'sapatos', '鞋', '靴'],
  vest: ['vest', 'vests', 'gilet', 'gilets', 'chaleco', 'chalecos', 'colete', 'coletes', '背心', '马甲'],
  glasses: ['glasses', 'goggles', 'lunettes', 'gafas', 'oculos', '眼镜', '护目镜'],
  hoodie: ['hoodie', 'hoodies', 'sweat', 'sweats', 'sweatshirt', 'sudadera', 'sudaderas', 'moletom', 'moletons', '卫衣'],
  tshirt: ['t-shirt', 't-shirts', 'tshirt', 'tee shirt', 'camiseta', 'camisetas', 't恤'],
  apron: ['apron', 'aprons', 'tablier', 'tabliers', 'delantal', 'delantales', 'avental', 'aventais', '围裙'],
  uniform: ['uniform', 'uniforms', 'uniforme', 'uniformes', '制服'],
  mat: ['mat', 'mats', 'tapis', 'esterilla', 'esterillas', 'tapete', 'tapetes', '垫'],
  towel: ['towel', 'towels', 'serviette', 'serviettes', 'toalla', 'toallas', 'toalha', 'toalhas', '毛巾'],
  bag: ['bag', 'bags', 'tote', 'sac', 'sacs', 'bolsa', 'bolsas', 'sacola', 'mochila', '袋', '包'],
  pen: ['pen', 'pens', 'stylo', 'stylos', 'boligrafo', 'boligrafos', 'caneta', 'canetas', '笔'],
  notebook: ['notebook', 'notebooks', 'carnet', 'carnets', 'cuaderno', 'cuadernos', 'caderno', 'cadernos', '笔记本'],
  cup: ['cup', 'cups', 'gobelet', 'gobelets', 'tasse', 'vaso', 'vasos', 'copo', 'copos', '杯'],
  bottle: ['bottle', 'bottles', 'gourde', 'gourdes', 'bouteille', 'botella', 'botellas', 'garrafa', 'garrafas', '水瓶', '水壶'],
  balloon: ['balloon', 'balloons', 'ballon', 'ballons', 'globo', 'globos', 'balao', 'baloes', '气球'],
  wristband: ['wristband', 'wristbands', 'bracelet', 'bracelets', 'pulsera', 'pulseras', 'pulseira', 'pulseiras', '腕带'],
  scrubs: ['scrubs', 'scrub', 'blouse medicale', 'tenue medicale', 'pijama quirurgico', 'pijama cirurgico', '手术服', '刷手服'],
  firstaid: ['first aid', 'premiers secours', 'trousse de secours', 'botiquin', 'primeiros socorros', '急救'],
  respirator: ['respirator', 'respirators', 'respirateur', 'respirateurs', 'respirador', 'respiradores', '呼吸器'],
  harness: ['harness', 'harnesses', 'harnais', 'arnes', 'cinto de seguranca', '安全带'],
  coverall: ['coverall', 'coveralls', 'combinaison', 'combinaisons', 'overol', 'mono', 'macacao', '连体服', '工作服'],
  hearing: ['earplug', 'earplugs', 'ear muffs', 'hearing', 'auditive', 'bouchons', 'tapones', 'auditiva', 'protetor auricular', '耳塞', '耳罩'],
  legging: ['legging', 'leggings', 'mallas', '紧身裤', '瑜伽裤'],
  lanyard: ['lanyard', 'lanyards', 'tour de cou', 'cordon', 'cordones', 'cordao', '挂绳'],
  keychain: ['keychain', 'keychains', 'porte-cle', 'porte-cles', 'llavero', 'llaveros', 'chaveiro', 'chaveiros', '钥匙扣'],
  hat: ['hat', 'hats', 'cap', 'caps', 'casquette', 'casquettes', 'chapeau', 'gorra', 'gorras', 'bone', 'bones', '帽'],
  tattoo: ['tattoo', 'tattoos', 'tatouage', 'tatouages', 'tatuaje', 'tatuajes', 'tatuagem', 'tatuagens', '纹身'],
};
