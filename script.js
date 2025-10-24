// script.js

// -----------------------------------------------------------------
// 1. Initialisation des Sélecteurs DOM et Variables de Stockage
// -----------------------------------------------------------------
const STORAGE_KEY_PRODUCTS = 'stock_products';
const STORAGE_KEY_SALES = 'stock_sales';

// Sélectionner les conteneurs de vues
const views = {
    list: document.getElementById('product-list-view'),
    productForm: document.getElementById('product-form-view'),
    saleForm: document.getElementById('sale-form-view'),
    saleReport: document.getElementById('sale-report-view'),
    about: document.getElementById('about-view')
};

// Éléments de la liste principale
const productTbody = document.getElementById('product-tbody');
const emptyStockMessage = document.getElementById('empty-stock-message');
const alertContainer = document.getElementById('alert-container');

// Formulaire Produit
const productForm = document.getElementById('product-form');
const productIdInput = document.getElementById('product-id');
const formTitle = document.getElementById('form-title');

// Formulaire Vente
const saleForm = document.getElementById('sale-form');
const saleProductSelect = document.getElementById('sale-product-id');
const saleQuantityInput = document.getElementById('sale-quantity');
const saleErrorDiv = document.getElementById('sale-error');

// Sélecteurs pour le prix unitaire et total
const saleUnitPriceInput = document.getElementById('sale-unit-price');
const saleTotalPriceInput = document.getElementById('sale-total-price');

// Rapport Vente
const saleReportTbody = document.getElementById('sale-report-tbody');
const saleReportTfoot = document.getElementById('sale-report-tfoot');
const emptySalesMessage = document.getElementById('empty-sales-message');


// -----------------------------------------------------------------
// 2. Fonctions de Gestion des Données (LocalStorage)
// -----------------------------------------------------------------

/** Récupère les produits du localStorage. */
const getProducts = () => {
    const productsJson = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return productsJson ? JSON.parse(productsJson) : [];
};

/** Sauvegarde les produits dans le localStorage. */
const saveProducts = (products) => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
};

/** Récupère les ventes du localStorage. */
const getSales = () => {
    const salesJson = localStorage.getItem(STORAGE_KEY_SALES);
    return salesJson ? JSON.parse(salesJson) : [];
};

/** Sauvegarde les ventes dans le localStorage. */
const saveSales = (sales) => {
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
};


// -----------------------------------------------------------------
// 3. Fonctions de Gestion de la Vue et du Rendu
// -----------------------------------------------------------------

/** Gère l'affichage d'une seule vue (Liste, Formulaire, Rapport, À Propos). */
const showView = (viewName) => {
    // 1. Cache toutes les vues
    Object.values(views).forEach(view => view.style.display = 'none');
    
    // Définit la couleur de fond du body (gestion par CSS principalement, mais on garde un reset)
    document.body.style.backgroundColor = 'var(--bg-light)';

    // 2. Affiche la vue demandée
    views[viewName].style.display = 'block';
    
    // 3. Actions spécifiques à la vue
    if (viewName === 'saleForm') {
        populateSaleProductSelect(); // Remplir la liste déroulante des produits
    } else if (viewName === 'saleReport') {
        renderSaleReport(); // Rendre le rapport de vente
    } else if (viewName === 'list') {
        renderProductList();
    }
};

/** Rend la liste des produits dans le tableau HTML. */
const renderProductList = () => {
    const products = getProducts();
    productTbody.innerHTML = ''; 
    let lowStockCount = 0;

    if (products.length === 0) {
        emptyStockMessage.style.display = 'block';
        alertContainer.innerHTML = '';
        return;
    }

    emptyStockMessage.style.display = 'none';

    products.forEach(product => {
        const isLowStock = product.quantity <= product.minStockLevel;
        if (isLowStock) {
            lowStockCount++;
        }

        const row = productTbody.insertRow();
        row.className = isLowStock ? 'low-stock' : '';

        // Insertion des données
        row.insertCell().textContent = product.name;
        row.insertCell().textContent = product.quantity;
        row.insertCell().textContent = product.price.toFixed(2);
        row.insertCell().textContent = product.minStockLevel;

        // Cellule des actions 
        const actionCell = row.insertCell();
        
        // Bouton Modifier
        const editBtn = document.createElement('button');
        editBtn.className = 'btn btn-warning btn-small';
        editBtn.textContent = 'Modifier';
        editBtn.onclick = () => editProduct(product.id);
        actionCell.appendChild(editBtn);
        
        actionCell.appendChild(document.createTextNode(' ')); 

        // Bouton Supprimer
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger btn-small';
        deleteBtn.textContent = 'Supprimer';
        deleteBtn.onclick = () => deleteProduct(product.id, product.name);
        actionCell.appendChild(deleteBtn);
    });
    
    // Affichage de l'alerte de stock bas
    if (lowStockCount > 0) {
        alertContainer.innerHTML = `
            <div class="alert alert-low-stock">
                ⚠️ **ATTENTION !** ${lowStockCount} produit(s) sont en stock faible (sous le seuil minimum).
            </div>
        `;
    } else {
        alertContainer.innerHTML = '';
    }
};


// -----------------------------------------------------------------
// 4. Gestion des Produits (Ajout, Modif, Suppr)
// -----------------------------------------------------------------

/** Prépare et affiche le formulaire pour l'édition ou l'ajout. */
const editProduct = (id = null) => {
    const products = getProducts();
    
    // Réinitialise le formulaire et l'ID caché
    productForm.reset();
    productIdInput.value = '';
    
    if (id !== null) {
        // Mode Édition
        const product = products.find(p => p.id === id);
        if (product) {
            formTitle.textContent = `Modifier le Produit : ${product.name}`;
            productIdInput.value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('quantity').value = product.quantity;
            document.getElementById('price').value = product.price;
            document.getElementById('minStockLevel').value = product.minStockLevel;
        }
    } else {
        // Mode Ajout
        formTitle.textContent = "Ajouter un Nouveau Produit";
    }
    
    showView('productForm');
};

/** Supprime un produit du localStorage. */
const deleteProduct = (id, name) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${name}" ?`)) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        renderProductList(); 
    }
};

/** Gère la soumission du formulaire d'ajout/modification. */
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const products = getProducts();
    const id = productIdInput.value;
    
    const name = document.getElementById('name').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const price = parseFloat(document.getElementById('price').value);
    const minStockLevel = parseInt(document.getElementById('minStockLevel').value);

    // Valide l'unicité du nom (uniquement en mode ajout)
    if (!id && products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert(`Erreur : Le produit "${name}" existe déjà.`);
        return;
    }

    if (id) {
        // Mode Édition
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = { id, name, quantity, price, minStockLevel };
        }
    } else {
        // Mode Création
        const newProduct = {
            id: Date.now().toString(), 
            name,
            quantity,
            price,
            minStockLevel
        };
        products.push(newProduct);
    }
    
    saveProducts(products); 
    showView('list'); 
});


// -----------------------------------------------------------------
// 5. Gestion des Ventes
// -----------------------------------------------------------------

/** Calcule et affiche le prix total de la vente. */
const calculateSalePrices = () => {
    // Remplacer la virgule par un point pour que parseFloat fonctionne
    let unitPriceString = saleUnitPriceInput.value.replace(',', '.'); 
    const unitPrice = parseFloat(unitPriceString) || 0;

    const quantity = parseFloat(saleQuantityInput.value) || 0;
    
    const totalPrice = unitPrice * quantity;

    // Mise à jour SEULEMENT du Prix Général (Total)
    saleTotalPriceInput.value = totalPrice.toFixed(2);
};

/** Rempli le <select> du formulaire de vente avec les produits disponibles. */
const populateSaleProductSelect = () => {
    const products = getProducts();
    saleProductSelect.innerHTML = '<option value="">-- Sélectionner un produit --</option>'; 
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Stock: ${product.quantity})`;
        
        // Stocke le prix du produit comme attribut de données pour l'initialisation du champ
        option.dataset.price = product.price;

        if (product.quantity <= 0) {
            option.disabled = true;
            option.textContent += ' - Épuisé';
        }
        
        saleProductSelect.appendChild(option);
    });
    
    saleErrorDiv.style.display = 'none'; 
    saleForm.reset(); 
    
    // Initialiser les champs de prix à zéro
    saleUnitPriceInput.value = '0.00';
    saleTotalPriceInput.value = '0.00';
};

// Événement 1 : Quand on change de produit : initialise le prix unitaire
saleProductSelect.addEventListener('change', () => {
    const selectedOption = saleProductSelect.options[saleProductSelect.selectedIndex];
    // Le prix de vente initial est basé sur le prix d'achat, mais l'utilisateur peut le changer
    const unitPrice = selectedOption && selectedOption.dataset.price 
                      ? parseFloat(selectedOption.dataset.price) 
                      : 0;

    saleUnitPriceInput.value = unitPrice.toFixed(2);
    
    // Déclencher le calcul du total
    calculateSalePrices();
});

// Événement 2 : Quand on change la quantité ou le prix unitaire, recalculer le total
saleQuantityInput.addEventListener('input', calculateSalePrices);
saleUnitPriceInput.addEventListener('input', calculateSalePrices); 


/** Gère la soumission du formulaire de vente. */
saleForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saleErrorDiv.style.display = 'none';

    const productId = saleProductSelect.value;
    const quantitySold = parseInt(saleQuantityInput.value);
    
    // Nettoyer le prix unitaire saisi par l'utilisateur
    let unitPriceString = saleUnitPriceInput.value.replace(',', '.');
    const unitPriceSold = parseFloat(unitPriceString);

    if (!productId || quantitySold <= 0 || isNaN(quantitySold) || unitPriceSold <= 0 || isNaN(unitPriceSold)) {
        saleErrorDiv.textContent = "Veuillez vérifier le produit, la quantité et le prix unitaire (doit être un nombre valide).";
        saleErrorDiv.style.display = 'block';
        return;
    }

    let products = getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    const product = products[productIndex];

    if (product.quantity < quantitySold) {
        saleErrorDiv.textContent = `Stock insuffisant : Seulement ${product.quantity} unité(s) disponible(s).`;
        saleErrorDiv.style.display = 'block';
        return;
    }

    // 1. Enregistrement de la Vente
    const sales = getSales();
    const sale = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        unitPrice: unitPriceSold, 
        quantitySold: quantitySold,
        totalPrice: unitPriceSold * quantitySold, 
        saleDate: new Date().toISOString()
    };
    sales.push(sale);
    saveSales(sales);

    // 2. Mise à jour du Stock
    products[productIndex].quantity -= quantitySold;
    saveProducts(products);

    showView('list');
});


// -----------------------------------------------------------------
// 6. Gestion du Rapport de Vente
// -----------------------------------------------------------------

/** Rend le tableau du rapport de vente. */
const renderSaleReport = () => {
    // Récupère les ventes et les trie par date descendante
    const sales = getSales().sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate)); 
    saleReportTbody.innerHTML = '';
    saleReportTfoot.innerHTML = '';
    
    let totalRevenue = 0;
    
    const reportActions = document.querySelector('.report-actions'); 

    if (sales.length === 0) {
        emptySalesMessage.style.display = 'block';
        if (reportActions) reportActions.style.display = 'none';
        return;
    }
    emptySalesMessage.style.display = 'none';
    if (reportActions) reportActions.style.display = 'block';

    sales.forEach(sale => {
        totalRevenue += sale.totalPrice;

        const row = saleReportTbody.insertRow();
        
        // Formatage de la date
        const date = new Date(sale.saleDate);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        row.insertCell().textContent = formattedDate;
        row.insertCell().textContent = sale.productName;
        row.insertCell().textContent = sale.unitPrice.toFixed(2);
        row.insertCell().textContent = sale.quantitySold;
        row.insertCell().textContent = sale.totalPrice.toFixed(2);
    });

    // Rendu du pied de tableau (Total)
    const totalRow = saleReportTfoot.insertRow();
    const totalHeader = document.createElement('th');
    totalHeader.colSpan = 4;
    totalHeader.style.textAlign = 'right';
    totalHeader.textContent = 'Revenu Total Généré :';
    totalRow.appendChild(totalHeader);
    
    const revenueCell = document.createElement('th');
    revenueCell.textContent = `${totalRevenue.toFixed(2)} €`;
    totalRow.appendChild(revenueCell);
};


// -----------------------------------------------------------------
// 7. Événements Globaux et Démarrage
// -----------------------------------------------------------------

// Bouton pour Imprimer le Rapport
document.getElementById('print-report-btn').onclick = () => {
    window.print(); 
};

// Boutons de navigation (bascule de vue)
document.getElementById('show-add-btn').onclick = () => editProduct(null);
document.getElementById('show-sell-btn').onclick = () => showView('saleForm');
document.getElementById('show-report-btn').onclick = () => showView('saleReport');
document.getElementById('show-about-btn').onclick = () => showView('about'); 

// Boutons d'annulation (retour à la liste)
document.getElementById('cancel-form-btn').onclick = () => showView('list');
document.getElementById('cancel-sale-btn').onclick = () => showView('list');
document.getElementById('cancel-about-btn').onclick = () => showView('list'); 

// Initialisation de la vue lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log("Script.js chargé ! L'application StockApp Melchisédech est prête.");
    showView('list');
});