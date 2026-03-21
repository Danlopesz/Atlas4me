import csv

# Altere para os caminhos corretos da sua maquina
input_file = r"c:\ProjectAtlas\Atlas4me-React\Basepaises.csv"
output_file = r"c:\ProjectAtlas\Atlas4me-React\backend\src\main\resources\db\migration\V3__insert_world_countries.sql"

country_info = {
    'Brazil': ('Brasil', 'BR', -14.235, -51.9253, 'SOUTH_AMERICA'),
    'United States': ('Estados Unidos', 'US', 37.0902, -95.7129, 'NORTH_AMERICA'),
    'Canada': ('Canadá', 'CA', 56.1304, -106.3468, 'NORTH_AMERICA'),
    'Mexico': ('México', 'MX', 23.6345, -102.5528, 'NORTH_AMERICA'),
    'Argentina': ('Argentina', 'AR', -38.4161, -63.6167, 'SOUTH_AMERICA'),
    'Chile': ('Chile', 'CL', -35.6751, -71.543, 'SOUTH_AMERICA'),
    'Peru': ('Peru', 'PE', -9.19, -75.0152, 'SOUTH_AMERICA'),
    'Colombia': ('Colômbia', 'CO', 4.5709, -74.2973, 'SOUTH_AMERICA'),
    'Bolivia': ('Bolívia', 'BO', -16.2902, -63.5887, 'SOUTH_AMERICA'),
    'Germany': ('Alemanha', 'DE', 51.1657, 10.4515, 'EUROPE'),
    'France': ('França', 'FR', 46.2276, 2.2137, 'EUROPE'),
    'Spain': ('Espanha', 'ES', 40.4637, -3.7492, 'EUROPE'),
    'Switzerland': ('Suíça', 'CH', 46.8182, 8.2275, 'EUROPE'),
    'Italy': ('Itália', 'IT', 41.8719, 12.5674, 'EUROPE'),
    'United Kingdom': ('Reino Unido', 'GB', 55.3781, -3.436, 'EUROPE'),
    'Russia': ('Rússia', 'RU', 61.524, 105.3188, 'EUROPE'),
    'China': ('China', 'CN', 35.8617, 104.1954, 'ASIA'),
    'India': ('Índia', 'IN', 20.5937, 78.9629, 'ASIA'),
    'Japan': ('Japão', 'JP', 36.2048, 138.2529, 'ASIA'),
    'South Korea': ('Coreia do Sul', 'KR', 35.9078, 127.7669, 'ASIA'),
    'Thailand': ('Tailândia', 'TH', 15.87, 100.9925, 'ASIA'),
    'Indonesia': ('Indonésia', 'ID', -0.7893, 113.9213, 'ASIA'),
    'Australia': ('Austrália', 'AU', -25.2744, 133.7751, 'OCEANIA'),
    'New Zealand': ('Nova Zelândia', 'NZ', -40.9006, 174.886, 'OCEANIA'),
    'Egypt': ('Egito', 'EG', 26.8206, 30.8025, 'AFRICA'),
    'Nigeria': ('Nigéria', 'NG', 9.082, 8.6753, 'AFRICA'),
    'South Africa': ('África do Sul', 'ZA', -30.5595, 22.9375, 'AFRICA'),
    'Saudi Arabia': ('Arábia Saudita', 'SA', 23.8859, 45.0792, 'ASIA'),
    'Turkey': ('Turquia', 'TR', 38.9637, 35.2433, 'ASIA'),
    # --- ADICIONADOS OS 7 RESTANTES ---
    'Uruguay': ('Uruguai', 'UY', -32.5228, -55.7658, 'SOUTH_AMERICA'),
    'Paraguay': ('Paraguai', 'PY', -23.4425, -58.4438, 'SOUTH_AMERICA'),
    'Ecuador': ('Equador', 'EC', -1.8312, -78.1834, 'SOUTH_AMERICA'),
    'Venezuela': ('Venezuela', 'VE', 6.4238, -66.5897, 'SOUTH_AMERICA'),
    'Guyana': ('Guiana', 'GY', 4.8604, -58.9302, 'SOUTH_AMERICA'),
    'Suriname': ('Suriname', 'SR', 3.9193, -56.0278, 'SOUTH_AMERICA'),
    'French Guiana': ('Guiana Francesa', 'GF', 3.9339, -53.1258, 'SOUTH_AMERICA')
}

questions_data = [
    ('hemisphere_north', 'Este país fica no hemisfério norte?', 'GEOGRAFIA'),
    ('hemisphere_west', 'Este país fica no hemisfério ocidental?', 'GEOGRAFIA'),
    ('tropical_country', 'Este é um país predominantemente tropical?', 'GEOGRAFIA'),
    ('is_island', 'Esse país é uma ilha ou país insular?', 'GEOGRAFIA'),
    ('is_old_world', 'Este país faz parte do Velho Mundo (Europa, Ásia ou África)?', 'GEOGRAFIA'),
    ('in_europe', 'Este país fica na Europa?', 'GEOGRAFIA'),
    ('in_asia', 'Este país fica na Ásia?', 'GEOGRAFIA'),
    ('in_africa', 'Este país fica na África?', 'GEOGRAFIA'),
    ('in_north_america', 'Este país fica na América do Norte ou Central?', 'GEOGRAFIA'),
    ('in_south_america', 'Este país fica na América do Sul?', 'GEOGRAFIA'),
    ('in_oceania', 'Este país fica na Oceania?', 'GEOGRAFIA'),
    ('population_gt_50m', 'A população do país é superior a 50 milhões de habitantes?', 'POPULACAO'),
    ('area_gt_1m_km2', 'Este país tem área territorial maior que 1 milhão de km²?', 'GEOGRAFIA'),
    ('is_landlocked', 'Este país não possui costa marítima (sem saída para o mar)?', 'GEOGRAFIA'),
    ('spanish_official', 'O espanhol é um dos idiomas oficiais?', 'CULTURA'),
    ('english_official', 'O inglês é um dos idiomas oficiais?', 'CULTURA'),
    ('arabic_official', 'O árabe é um dos idiomas oficiais?', 'CULTURA'),
    ('portuguese_official', 'O português é o idioma oficial?', 'CULTURA'),
    ('eu_member', 'Este país é membro da União Europeia?', 'POLITICA'),
    ('is_g20_member', 'Este país é membro do G20?', 'ECONOMIA'),
    ('is_monarchy', 'O país possui uma monarquia (reinante)?', 'POLITICA'),
    ('drives_on_left', 'Neste país a condução de veículos é pela esquerda (mão inglesa)?', 'CULTURA'),
    ('has_non_latin_alphabet', 'O país utiliza predominantemente um alfabeto ou escrita não-latina?', 'CULTURA'),
    ('is_predominantly_muslim', 'A religião predominante no país é o islamismo?', 'CULTURA')
]

existing_countries = {
    'Brazil': 1, 'Argentina': 2, 'Uruguay': 3, 'Paraguay': 4, 'Bolivia': 5, 
    'Chile': 6, 'Peru': 7, 'Ecuador': 8, 'Colombia': 9, 'Venezuela': 10,
    'Guyana': 11, 'Suriname': 12, 'French Guiana': 13
}

with open(input_file, 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)

with open(output_file, 'w', encoding='utf-8') as out:
    out.write("-- V3__insert_world_countries.sql\n")
    out.write("-- Migration gerada automaticamente com 36 paises do mundo a partir do CSV validado\n\n")
    
    out.write("-- =======================================================\n")
    out.write("-- 1. NOVOS PAISES\n")
    out.write("-- =======================================================\n")
    
    c_dict = {}
    next_c_id: int = 14
    
    country_values = []
    for row in rows:
        name_en = row['country']
        if name_en in country_info:
            pt_name, iso, lat, lon, cont = country_info[name_en]
            
            c_id = existing_countries.get(name_en, next_c_id)
            c_dict[name_en] = {'id': c_id, 'iso': iso}
            
            # Só insere se for um dos 23 novos (os de 1 a 13 já estão no banco da V1/V2)
            if name_en not in existing_countries:
                country_values.append(f"({c_id}, '{pt_name}', '{iso}', '/images/countries/{iso.lower()}.png', {lat}, {lon}, '{cont}')")
                next_c_id += 1  # type: ignore
                
    if country_values:
        out.write("INSERT IGNORE INTO countries (id, name, iso_code, image_url, latitude, longitude, continent) VALUES\n")
        out.write(",\n".join(country_values) + ";\n")
                
    out.write("\n-- =======================================================\n")
    out.write("-- 2. NOVAS PERGUNTAS\n")
    out.write("-- =======================================================\n")
    q_start_id = 16
    q_dict = {}
    
    question_values = []
    for i, q in enumerate(questions_data):
        q_id = q_start_id + i
        q_dict[q[0]] = q_id
        question_values.append(f"({q_id}, '{q[1]}', '{q[2]}', NULL)")
        
    if question_values:
        out.write("INSERT IGNORE INTO questions (id, text, category, helper_image_url) VALUES\n")
        out.write(",\n".join(question_values) + ";\n")
                  
    out.write("\n-- =======================================================\n")
    out.write("-- 3. CARACTERISTICAS GLOBAIS (GABARITO)\n")
    out.write("-- =======================================================\n")
    
    for i, q_tuple in enumerate(questions_data):
        col_name = q_tuple[0]
        q_text = q_tuple[1]
        q_id = q_start_id + i
        
        feature_values = []
        true_names = []
        false_names = []
        
        for row in rows:
            name_en = row['country']
            if name_en not in c_dict: 
                continue
            
            if col_name in row:
                c_id = c_dict[name_en]['id']
                iso = c_dict[name_en]['iso']
                val = row[col_name].strip()
                is_true = 'true' if val == '1' else 'false'
                pt_name = country_info[name_en][0] if name_en in country_info else name_en
                
                feature_values.append(f"({c_id}, {q_id}, {is_true}, '{iso}')")
                
                if is_true == 'true':
                    true_names.append(pt_name)
                else:
                    false_names.append(pt_name)
                
        if feature_values:
            if 0 < len(true_names) <= len(false_names):
                summary = f"(Verdadeiro: {', '.join(true_names)})"
            elif len(false_names) > 0:
                summary = f"(Falso: {', '.join(false_names)})"
            else:
                summary = "(Todos Verdadeiros)"
                
            out.write(f"\n-- Q{q_id}: {q_text} {summary}\n")
            out.write("INSERT IGNORE INTO country_features (country_id, question_id, is_true, iso_code) VALUES\n")
            out.write(",\n".join(feature_values) + ";\n")

print(f"Migration V3 gerada com sucesso em {output_file}")