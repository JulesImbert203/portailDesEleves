const markers = [];
let clickContainer;

function renderHomeButton() {
    //Fonction ayant pour but de créer un bouton "Home" qui permet de revenir à la page d'accueil
    ///!\\\ A adapter si l'on souhaite mettre une navbar classique
    const homeButton = this.document.createElement('button');
    homeButton.textContent = 'Home';
    homeButton.addEventListener('click', function() {
        window.location.href = '/';
    });

    homeButton.style.position = 'fixed';
    homeButton.style.top = '10px';
    homeButton.style.left = '10px';
    homeButton.style.zIndex = '10000';
    homeButton.style.backgroundColor = '#fefefe';
    homeButton.style.border = '1px solid #333';
    homeButton.style.borderRadius = '5px';
    //changer de couleur au survol
    homeButton.addEventListener('mouseover', function() {
        homeButton.style.backgroundColor = '#f0f0f0';
        homeButton.style.border = '1px solid #333';
        
        //changer de pointeur au survol
        homeButton.style.cursor = 'pointer';
    }
    );

    this.document.body.appendChild(homeButton);

}

function renderTableOfContentsButton() {
    //Fonction ayant pour but de créer un bouton "Sommaire" qui permet de revenir au sommaire
    const tableOfContentsButton = this.document.createElement('button');
    tableOfContentsButton.textContent = 'Sommaire';

    tableOfContentsButton.style.position = 'fixed';
    tableOfContentsButton.style.top = '10px';
    tableOfContentsButton.style.left = '100px';
    tableOfContentsButton.style.zIndex = '10000';
    tableOfContentsButton.style.backgroundColor = '#fefefe';
    tableOfContentsButton.style.border = '1px solid #333';
    tableOfContentsButton.style.borderRadius = '5px';
    //changer de couleur au survol
    tableOfContentsButton.addEventListener('mouseover', function() {
        tableOfContentsButton.style.backgroundColor = '#f0f0f0';
        tableOfContentsButton.style.border = '1px solid #333';
        
        //changer de pointeur au survol
        tableOfContentsButton.style.cursor = 'pointer';
    });

    tableOfContentsButton.addEventListener('click', function() {
        window.scrollTo(0, 851.8897637781*2);
    });

    this.document.body.appendChild(tableOfContentsButton);

}    

window.addEventListener('load', function() {
    
    renderHomeButton();

    renderTableOfContentsButton();

    markerList= document.createElement('div');
            
    markerList.id = 'marker-list';
        markerList.innerHTML = `
            <h2>Marqueurs</h2>
            <div id="marker-list-items"></div>
        `;
    document.body.appendChild(markerList);

    // Bouton de confirmation avant la suppression d'un marqueur
    confirmationDialog = document.createElement('div');
    confirmationDialog.id = 'confirmation-dialog';
    confirmationDialog.className = 'confirmation-dialog';
    confirmationDialog.innerHTML = `
        <p>Voulez-vous vraiment supprimer ce marqueur ?</p>
        <button id="confirm-yes">Oui</button>
        <button id="confirm-no">Non</button>
        `;

    document.body.appendChild(confirmationDialog);

    //Création d'une div permettant de recueillir les clics de l'utilisateur
    clickContainer = document.createElement('div');
    clickContainer.id = 'click-container';
    document.body.appendChild(clickContainer);
    clickContainer = document.getElementById('click-container');

    //Création d'une div permettant de recueillir les marqueurs
    //Il a un z-index plus élevé que le clickContainer pour que les listeners des marqueurs 
    // ne se confondent pas avec ceux du clickContainer

    markerContainer=document.createElement('div');
    markerContainer.id = 'marker-container';
    document.body.appendChild(markerContainer);
    markerContainer = document.getElementById('marker-container');

    clickContainer.addEventListener('dblclick', function(event) {
        const y = event.clientY + window.scrollY;

        const marker = {
            y: y
        };
        markers.push(marker);
        renderMarkers();
    });

    //Ajout des événements de clic sur les éléments du sommaire 
    //pour permettre de se rendre à la page correspondante
    const sommaires_infos= this.document.getElementById('outer-wrapper-2').children[1].children[0].children;
    for (let i = 0; i < sommaires_infos.length; i++) {
        const article = sommaires_infos[i];

        // Récupérer l'élément 'a'
        const a = article.getElementsByTagName('a')[0];
        // Récupérer le contenu du textContent avant les '.'
        const pageNumber = parseInt(article.textContent.split('.')[0].replace(' ', ''));
        article.style.cursor = 'pointer';
        
        article.addEventListener('click', function(event) {
            event.preventDefault(); // Empêcher le comportement par défaut du lien
            const y = (Math.max(pageNumber - 1, 0)) * 851.8897637781;
            window.scrollTo(0, y);

        });
        
    }

    
});

function renderMarkers() {
    //Fonction ayant pour but de rendre les marqueurs à création ou suppression de ceux-ci
    const markerList = document.getElementById('marker-list-items');
    markerList.innerHTML = ''; // Clear previous markers
    document.getElementById('marker-container').innerHTML='';
    markers.forEach(marker => {
        const markerElement = document.createElement('div');
        markerElement.className = 'marker-rectangle';
        markerElement.style.top = `${marker.y - 10}px`; // Adjust for marker size
        markerContainer.appendChild(markerElement);

        // Add marker to the list
        const listItem = document.createElement('div');
        const markerNameDisplay = document.createElement('div');
        const markerNameButton = document.createElement('button');
        const markerNameInput = document.createElement('input');
        const markerPosition = document.createElement('div');
        const markerButton = document.createElement('button');

        markerPosition.textContent = `Page ${parseInt(marker.y/851.8897637781) +1}`;

        markerNameDisplay.textContent = 'Nom du marqueur';
        markerNameButton.textContent = 'Changer';
        markerNameInput.type = 'text';
        markerNameInput.className = 'marker-name-input';

        markerButton.textContent = 'Aller à';

        markerButton.addEventListener('click', function() {
            window.scrollTo(0, marker.y - window.innerHeight / 2);
        });

        markerNameButton.addEventListener('click', function() {
            markerNameDisplay.style.display = 'none';
            markerNameButton.style.display = 'none';
            markerNameInput.style.display = 'block';
            markerNameInput.focus();
        });

        markerNameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                markerNameDisplay.textContent = markerNameInput.value;
                markerNameDisplay.style.display = 'block';
                markerNameButton.style.display = 'inline';
                markerNameInput.style.display = 'none';
            }
        });

        listItem.appendChild(markerNameDisplay);
        listItem.appendChild(markerNameButton);
        listItem.appendChild(markerNameInput);
        listItem.appendChild(markerPosition);
        listItem.appendChild(markerButton);

        listItem.style.display = 'grid';

        markerList.appendChild(listItem);

        // Add click event listener to the marker for confirmation dialog
        markerElement.addEventListener('click', function() {
            const confirmationDialog = document.getElementById('confirmation-dialog');
            confirmationDialog.style.display = 'block';

            document.getElementById('confirm-yes').addEventListener('click', function() {
                const index = markers.indexOf(marker);
                if (index > -1) {
                    markers.splice(index, 1);
                }
                renderMarkers();
                confirmationDialog.style.display = 'none';
            });

            document.getElementById('confirm-no').addEventListener('click', function() {
                confirmationDialog.style.display = 'none';
            });
        });
    });
}