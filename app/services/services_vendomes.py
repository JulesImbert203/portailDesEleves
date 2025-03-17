import cssutils
import os
from bs4 import BeautifulSoup
import re
import shutil

def css_to_dict(css_file):
    css = cssutils.parseFile(css_file)
    css_dict = {}
    for rule in css:
        if rule.type == rule.STYLE_RULE:
            css_dict[rule.selectorText] = {}
            for prop in rule.style:
                css_dict[rule.selectorText][prop.name] = prop.value
    return css_dict

def dict_to_css(css_dict, css_file):
    css = cssutils.CSSStyleSheet()
    for selector, props in css_dict.items():
        rule = cssutils.css.CSSStyleRule(selectorText=selector)
        for prop, value in props.items():
            rule.style[prop] = value
        css.add(rule)
    with open(css_file, 'w') as f:
        f.write(css.cssText)

def filter_css(css_dict):
    filtered_css_dict = {}
    for selector, props in css_dict.items():
        if not selector.startswith('#'):
            filtered_css_dict[selector] = props

    return filtered_css_dict

def dict_to_txt_look_css(css_dict, txt_file):
    with open(txt_file, 'w') as f:
        for selector, props in css_dict.items():
            f.write(selector + '{ \n')
            for prop, value in props.items():
                f.write(f'  {prop}: {value};\n')
            f.write('}\n')


def preprocess_css(css_file, txt_file):
    css_dict = css_to_dict(css_file)
    filtered_css_dict = filter_css(css_dict)
    dict_to_txt_look_css(filtered_css_dict, txt_file)


def filter_non_id_styles_to_txt(input_file_path, output_file_path):
    """
    Puisque les styles id sont déjà appliqués dans le fichier HTML, 
    on ne garde que les styles de classe et de balise.
    """
    with open(input_file_path, 'r') as file:
        lines = file.readlines()

    filtered_lines = [line for line in lines if not line.strip().startswith('#')]

    with open(output_file_path, 'w') as file:
        file.writelines(filtered_lines)


def lire_fichier(chemin):
        with open(chemin, 'r', encoding='utf-8') as fichier:
            return fichier.read()

def extraire_styles(css_content):
    """
    Extraire les styles CSS sous forme de dictionnaire à partir du fichier CSS
    généré par InDesign.
    """

    sheet = cssutils.parseString(css_content)
    styles_dict = {}

    for rule in sheet:
        if rule.type == rule.STYLE_RULE:
            for selector in rule.selectorList:
                styles_dict[selector.selectorText] = rule.style.cssText

    return styles_dict

def main_css(css_path):
    """
    Récupérer les styles CSS du fichier CSS généré par InDesign.
    """

    css_content = lire_fichier(css_path)
    styles_dict = extraire_styles(css_content)
    return styles_dict


def main_vendome(folder,template_destination,output_name='output'):
    """
    Fonction principal qui à partir du dossier uploadé dézipé, 
    génère le fichier HTML final avec les styles CSS appliqués.
    """
    
    # Récupérer les fichiers HTML des pages du Vendôme dans le dossier spécifié
    html_files = [f for f in os.listdir(folder) if f.endswith('.html') and f != 'output.html']

    # Récupérer le préfixe commun des fichiers HTML
    prefix = os.path.commonprefix(html_files)

    # Chemins des dossiers source et destination des ressources images et scripts
    dossier_source_js = os.path.join(folder, f'{prefix}-web-resources/script')

    dossier_destination_js = os.path.join('static/js/vendomes', f'{prefix}-web-resources')

    font_file = os.path.join('static/js/vendomes', f'{prefix}-web-resources/FontData.js')

    dossier_source_img = os.path.join(folder, f'{prefix}-web-resources/image')

    dossier_destination_img = os.path.join('static/images/vendomes', f'{prefix}-web-resources')

    css_file=os.path.join(folder, f'{prefix}-web-resources/css/idGeneratedStyles.css')
    txt_file=os.path.join(folder, f'{prefix}-web-resources/css/idGeneratedStyles.txt')

    # Prétraiter le fichier CSS pour l'intégrer dans le fichier HTML et ne garder que les styles de classe et de balise
    preprocess_css(css_file=css_file,txt_file=txt_file)
    
    css_txt=''

    # Récupérer le contenu du fichier txt
    with open(txt_file, 'r', encoding='utf-8') as file:
        css_txt = file.read()


    
   

    #Copier les dossiers liées aux ressources images et scripts
    try :
        shutil.copytree(dossier_source_js, dossier_destination_js)
    except FileExistsError:
        pass

    try :
        shutil.copytree(dossier_source_img, dossier_destination_img)
    except FileExistsError:
        pass


    prefix = os.path.join(folder, prefix)

    html_path = prefix

    html_amount = len(html_files)

    # Récupérer les styles CSS du fichier CSS généré par InDesign pour les appliquer dans le fichier HTML final
    css_path = prefix + '-web-resources/css/idGeneratedStyles.css'
    styles_dict = main_css(css_path)

    id_styles = {}
    class_styles = {}

    for selector, style in styles_dict.items():
        if selector.startswith('.'):
            style_list = style.split(';\n')
            style_dict = {}
            for s in style_list:
                if s:
                    key, value = s.split(': ')
                    style_dict[key] = value
            class_styles[selector[1:]] = style_dict
        elif selector.startswith('#'):
            style_list = style.split(';\n')
            style_dict = {}
            for s in style_list:
                if s:
                    key, value = s.split(': ')
                    style_dict[key] = value
            id_styles[selector[1:]] = style_dict

    def process_styles_enfants(element, offset=0, niveau=0, i=0):
        """
        A l'aide des styles récupérés dans le fichier CSS,
        cette fonction parcourt récursivement les éléments du fichier HTML
        pour appliquer les styles correspondants et préparer la création du fichier HTML final.
        """

        # Ajouter les styles récupérés aux éléments
        if 'id' in element.attrs and element["id"] in id_styles:
            style_dict = id_styles[element["id"]]
            style_str = '; '.join([f'{k}: {v}' for k, v in style_dict.items()])
            if 'style' in element.attrs:
                element['style'] += '; ' + style_str
            else:
                element['style'] = style_str

        if 'class' in element.attrs:
            classes = ' '.join(element['class'])
            if classes in class_styles:
                style_dict = class_styles[classes]
                style_str = '; '.join([f'{k}: {v}' for k, v in style_dict.items()])
                if 'style' in element.attrs:
                    element['style'] += '; ' + style_str
                else:
                    element['style'] = style_str

        # Convertir l'attribut 'top' en pixels
        if 'style' in element.attrs:
            styles = element['style'].split(';')
            for j, style in enumerate(styles):
                if 'top' in style:
                    key, value = style.split(':')
                    if 'px' not in value:
                        value = f'{float(value.strip())}px'
                        styles[j] = f'{key}: {value}'
            element['style'] = '; '.join(styles)

        # Ajouter une condition spécifique pour 'outer-wrapper'
        if 'id' in element.attrs and element['id'].startswith('outer-wrapper'):
            if 'style' in element.attrs:
                element['style'] += f'; top: {0}px'
            else:
                element['style'] = f'top: {0}px'

        # Parcourir récursivement les enfants de l'élément
        for enfant in element.children:
            if enfant.name:  # Vérifier si l'enfant est un élément (et non du texte ou autre)
                process_styles_enfants(enfant, niveau + 1, offset, i)

    def enregistrer_html(soup, chemin):
        with open(chemin, 'w', encoding='utf-8') as fichier:
            fichier.write(str(soup))

    def main_update(html_path, output_path, offset=0, i=0):
        html_content = lire_fichier(html_path)
        soup = BeautifulSoup(html_content, 'html.parser')

        # Lire et ajouter le contenu des fichiers CSS liés
        head = soup.head
        for link in soup.find_all('link', rel='stylesheet'):
            css_file_path = link['href']
            css_content = lire_fichier(os.path.join(folder, css_file_path))
            styles_dict = extraire_styles(css_content)

            # Filtrer les styles d'id sauf celui de #outer-wrapper
            filtered_styles = {k: v for k, v in styles_dict.items() if not k.startswith('#')}

            # Convertir les styles filtrés en texte CSS
            css_filtered_content = '\n'.join([f'{k} {{{v}}}' for k, v in filtered_styles.items()])

            style_tag = soup.new_tag('style')
            style_tag.string = css_filtered_content
            head.append(style_tag)
            link.decompose()

        # Ajouter le style outer_wrapper_class dans le head
        outer_wrapper_class = """.outer-wrapper {
            -ms-transform: translate(0, 0) rotate(0deg) skew(0deg) scale(1, 1);
            -ms-transform-origin: 0% 0%;
            -webkit-transform: translate(0, 0) rotate(0deg) skew(0deg) scale(1, 1);
            -webkit-transform-origin: 0% 0%;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin-left: auto;
            margin-right: auto;
            position: relative;
            transform: translate(0, 0) rotate(0deg) skew(0deg) scale(1, 1);
            transform: translate(0, 0) rotate(0deg) skew(0deg) scale(1, 1);
            transform-origin: 0% 0%;
            transform-origin: 0% 0%;
            background-color: #fff;
        }"""
        style_tag = soup.new_tag('style')
        style_tag.string = outer_wrapper_class
        head.append(style_tag)

        # Ajouter la classe outer-wrapper à l'élément avec l'id outer-wrapper
        element_principal = soup.body
        outer_wrapper_element = element_principal.find(id='outer-wrapper')
        if outer_wrapper_element:
            outer_wrapper_element['class'] = outer_wrapper_element.get('class', []) + ['outer-wrapper']
            outer_wrapper_element.attrs['id'] = f'outer-wrapper-{i}'
        if element_principal:
            process_styles_enfants(element_principal, offset, i=i)
            enregistrer_html(soup, output_path)
        else:
            print("L'élément principal n'a pas été trouvé.")

    main_update(html_path + '.html', html_path + '_updated.html')

    for i in range(1, html_amount):
        main_update(html_path + f'-{i}.html', html_path + f'-{i}_updated.html', offset=1000 * i, i=i)

    filter_non_id_styles_to_txt(html_path + '-web-resources/css/idGeneratedStyles.css', html_path + '-web-resources/css/idGeneratedStyles_filtered.css')
    
   
    # Générer la base du HTML final à l'aide des styles récupérés 
    html_basis = f"""
    <!DOCTYPE html>
    <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
    <meta content="width=595.2755905509px" name="viewport"/>
    <meta charset="utf-8">
    <title>Maquette_V2</title>
    <script src="/{font_file}" type="text/javascript"></script>
    <script src="/static/js/markers.js" type="text/javascript"></script>
    """+"""
   
    </meta>
    """+f"""
    <style>
    {css_txt}
    </style>
    """+"""
    <style>body {background-color: #B3B3B3;
    margin: 0}</style><style>.outer-wrapper {
            -ms-transform: translate(0, 0) rotate(0deg) skew(0deg) scale(1, 1);
            -ms-transform-origin: 0% 0%;
            -webkit-transform: translate(0, 0) rotate(0deg) skew(0deg) scale(1, 1);
            -webkit-transform-origin: 0% 0%;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            margin-left: auto;
            margin-right: auto;
            margin-top : 10px;
            position: relative;
            transform: translate(0, 0) rotate(0deg) skew(0deg) scale(1, 1);
            transform: translate(0, 0) rotate(0deg) skew(0deg) scale(1, 1);
            transform-origin: 0% 0%;
            transform-origin: 0% 0%;
            background-color: #fff;
        }</style>
        <style>
            .marker-rectangle {
                position: absolute;
                left: 50px;
                width: 50px; /* Largeur du rectangle ajustée */
                height: 20px; /* Hauteur du rectangle */
                background-color: red;
                border-radius: 5px;
                transform: translateX(-50%); /* Centrer horizontalement */
            }
            .marker-rectangle::before {
                content: '';
                position: absolute;
                top: 50%;
                right: -10px; /* Position de la pointe */
                width: 0;
                height: 0;
                border-top: 10px solid transparent;
                border-bottom: 10px solid transparent;
                border-left: 20px solid red;
                transform: translateY(-50%);
            }
            #marker-list {
                position: fixed;
                top: 10px;
                right: 10px;
                background-color: white;
                border: 1px solid #ddd;
                padding: 10px;
                max-width: 200px;
                max-height: 300px;
                overflow-y: auto;
            }
            .marker-name-input {
                display: none;
            }
            .confirmation-dialog {
                display: none;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background-color: white;
                border: 1px solid #ddd;
                padding: 20px;
                box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
                z-index: 1000;
            }
            .confirmation-dialog button {
                margin-top: 10px;
            }

            #click-container {
                position: fixed;
                top: 0;
                left: 0;
                width: 20%;
                height: 100%;
                background-color: transparent;
            }
        </style>
        </head>
    <body id="Maquette_V2" lang="fr-FR">

    </body>
    </html>
    """

    soup = BeautifulSoup(html_basis, 'html.parser')

    body = soup.body

    html_path = f'{prefix}_updated.html'
    with open(html_path, 'r', encoding='utf-8') as fichier:
        html_content = fichier.read()
        temp_soup = BeautifulSoup(html_content, 'html.parser')
        body.append(temp_soup.body)

    for i in range(1, html_amount):
        html_path = f'{prefix}-{i}_updated.html'
        with open(html_path, 'r', encoding='utf-8') as fichier:
            html_content = fichier.read()
            temp_soup = BeautifulSoup(html_content, 'html.parser')
            body.append(temp_soup.body)

    output_folder = template_destination

    enregistrer_html(soup, os.path.join(output_folder, 'output.html'))

    # Supprimer les fichiers temporaires '*_updated.html'
    os.remove(f'{prefix}_updated.html')
    for i in range(1, html_amount):
        os.remove(f'{prefix}-{i}_updated.html')

    # Lire le contenu du fichier HTML
    with open(os.path.join(output_folder, 'output.html'), 'r', encoding='utf-8') as fichier:
        contenu_html = fichier.read()

    # Analyser le contenu HTML avec BeautifulSoup
    soup = BeautifulSoup(contenu_html, 'html.parser')

    # Parcourir toutes les balises <img> et mettre à jour l'attribut 'src' si nécessaire
    for img in soup.find_all('img'):
        if 'src' in img.attrs and not re.match(r'^data:image/', img['src']):
            img['src'] = '/'+dossier_destination_img +'/' + img['src'].split('/')[-1]

    # Enregistrer les modifications dans le fichier HTML
    with open(os.path.join(output_folder, output_name+'.html'), 'w', encoding='utf-8') as fichier:
        fichier.write(str(soup))
