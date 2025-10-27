// script.js

// 1. Authentification et Initialisation

// Identifiants factices (simulés)
const VALID_USERNAME = 'admin';
const VALID_PASSWORD = 'password'; 

// Sélecteurs d'authentification
const authView = document.getElementById('auth-view');
const mainAppContainer = document.getElementById('main-app-container');
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const loginErrorDiv = document.getElementById('login-error');
const togglePassword = document.getElementById('togglePassword');

// Logique pour masquer/afficher le mot de passe (Toggle Visibility)
togglePassword.addEventListener('click', function() {
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    passwordInput.setAttribute('type', type);
    // Changer l'icône de l'œil
    this.classList.toggle('fa-eye-slash');
    this.classList.toggle('fa-eye');
});

// Gérer la soumission du formulaire de connexion
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    loginErrorDiv.style.display = 'none';

    const enteredUsername = usernameInput.value;
    const enteredPassword = passwordInput.value;

    if (enteredUsername === VALID_USERNAME && enteredPassword === VALID_PASSWORD) {
        // Succès de la connexion
        authView.style.display = 'none';
        mainAppContainer.style.display = 'block';
        showView('dashboard'); // Afficher la première vue après connexion
    } else {
        // Échec de la connexion
        loginErrorDiv.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
        loginErrorDiv.style.display = 'block';
    }
});


// 2. Initialisation des Sélecteurs DOM et Variables de Stockage
const STORAGE_KEY_PRODUCTS = 'stock_products';
const STORAGE_KEY_SALES = 'stock_sales';
const STORAGE_KEY_PURCHASES = 'stock_purchases'; 

const views = {
    dashboard: document.getElementById('dashboard-view'), 
    list: document.getElementById('product-list-view'),
    productForm: document.getElementById('product-form-view'),
    purchaseForm: document.getElementById('purchase-form-view'), 
    saleForm: document.getElementById('sale-form-view'),
    saleReport: document.getElementById('sale-report-view'),
    purchaseReport: document.getElementById('purchase-report-view'),
    about: document.getElementById('about-view') 
};

// Sélecteurs du Dashboard
const kpiRevenue = document.getElementById('kpi-revenue');
const kpiCost = document.getElementById('kpi-cost');
const kpiProfit = document.getElementById('kpi-profit');
const kpiCount = document.getElementById('kpi-count');
const alertContainerDashboard = document.getElementById('alert-container-dashboard');

// Inventaire et Formulaires
const productTbody = document.getElementById('product-tbody');
const productForm = document.getElementById('product-form');
const productIdInput = document.getElementById('product-id');
const formTitle = document.getElementById('form-title');
const emptyStockMessage = document.getElementById('empty-stock-message');
const alertContainer = document.getElementById('alert-container'); 

// Champs de Produit
const initialQuantityInput = document.getElementById('initialQuantity');
const priceInput = document.getElementById('price');
const globalCostInput = document.getElementById('globalCost');
const initialQuantityGroup = document.getElementById('initial-quantity-group');
const globalCostGroup = document.getElementById('global-cost-group');


// Formulaire d'Achat
const purchaseForm = document.getElementById('purchase-form');
const purchaseProductSelect = document.getElementById('purchase-product-id');
const purchaseQuantityInput = document.getElementById('purchase-quantity');
const purchaseUnitCostInput = document.getElementById('purchase-unit-cost');
const purchaseTotalCostInput = document.getElementById('purchase-total-cost');
const purchaseSupplierInput = document.getElementById('purchase-supplier');
const purchaseErrorDiv = document.getElementById('purchase-error');


// Formulaire de Vente
const saleForm = document.getElementById('sale-form');
const saleProductSelect = document.getElementById('sale-product-id');
const saleQuantityInput = document.getElementById('sale-quantity');
const saleUnitPriceInput = document.getElementById('sale-unit-price');
const saleTotalPriceInput = document.getElementById('sale-total-price');
const saleErrorDiv = document.getElementById('sale-error');
const saleCustomerNameInput = document.getElementById('sale-customer-name');
const saleDeliveryAddressInput = document.getElementById('sale-delivery-address');

// Rapports
const saleReportTbody = document.getElementById('sale-report-tbody');
const saleReportTfoot = document.getElementById('sale-report-tfoot');
const emptySalesMessage = document.getElementById('empty-sales-message');

const purchaseReportTbody = document.getElementById('purchase-report-tbody');
const purchaseReportTfoot = document.getElementById('purchase-report-tfoot');
const emptyPurchasesMessage = document.getElementById('empty-purchases-message');


// 3. Fonctions de Gestion des Données (LocalStorage)

const getProducts = () => {
    const productsJson = localStorage.getItem(STORAGE_KEY_PRODUCTS);
    return productsJson ? JSON.parse(productsJson) : [];
};
const saveProducts = (products) => {
    localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
};

const getSales = () => {
    const salesJson = localStorage.getItem(STORAGE_KEY_SALES);
    return salesJson ? JSON.parse(salesJson) : [];
};
const saveSales = (sales) => {
    localStorage.setItem(STORAGE_KEY_SALES, JSON.stringify(sales));
};

const getPurchases = () => {
    const purchasesJson = localStorage.getItem(STORAGE_KEY_PURCHASES);
    return purchasesJson ? JSON.parse(purchasesJson) : [];
};
const savePurchases = (purchases) => {
    localStorage.setItem(STORAGE_KEY_PURCHASES, JSON.stringify(purchases));
};


// 4. Gestion des Vues et du Rendu

const showView = (viewName) => {
    // Ne pas masquer l'authentification si l'utilisateur est connecté
    const allViews = Object.values(views);
    allViews.forEach(view => view.style.display = 'none');
    views[viewName].style.display = 'block';
    
    // Actions spécifiques à la vue
    if (viewName === 'dashboard') {
        renderDashboard(); 
    } else if (viewName === 'list') {
        renderProductList();
    } else if (viewName === 'purchaseForm') { 
        populatePurchaseProductSelect();
        purchaseForm.reset();
        purchaseUnitCostInput.value = '0.00';
        purchaseQuantityInput.value = '1';
        purchaseTotalCostInput.value = '0.00';
    } else if (viewName === 'saleForm') {
        populateSaleProductSelect(); 
    } else if (viewName === 'saleReport') {
        renderSaleReport(); 
    } else if (viewName === 'purchaseReport') { 
        renderPurchaseReport(); 
    }
};

/** Rend le tableau de bord avec les KPIs. */
const renderDashboard = () => {
    const products = getProducts();
    const sales = getSales();
    const purchases = getPurchases();

    // 1. Calcul des KPIs financiers
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.totalPrice, 0);
    const totalCost = purchases.reduce((sum, purchase) => sum + purchase.totalCost, 0);
    const grossProfit = totalRevenue - totalCost; // Marge Brute

    // 2. Calcul des KPIs d'inventaire
    const lowStockProducts = products.filter(p => p.quantity <= p.minStockLevel);
    const totalQuantityInStock = products.reduce((sum, p) => sum + p.quantity, 0);

    // 3. Mise à jour du DOM
    kpiRevenue.textContent = `${totalRevenue.toFixed(2)} €`;
    kpiCost.textContent = `${totalCost.toFixed(2)} €`;
    kpiProfit.textContent = `${grossProfit.toFixed(2)} €`;
    kpiCount.textContent = totalQuantityInStock.toString(); 
    
    // Appliquer la couleur de la marge brute
    kpiProfit.className = `kpi-value ${grossProfit >= 0 ? 'positive' : 'negative'}`;

    // Affichage des alertes de stock
    if (lowStockProducts.length > 0) {
        alertContainerDashboard.innerHTML = `
            <div class="alert alert-low-stock">
                ⚠️ **Alerte Stock !** ${lowStockProducts.length} produit(s) sont sous le seuil critique.
            </div>
        `;
    } else {
        alertContainerDashboard.innerHTML = '';
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
        row.insertCell().textContent = product.price.toFixed(2); // Prix d'Achat (Coût Standard)
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
    
    // Affichage de l'alerte de stock bas (dans la vue liste)
    if (lowStockCount > 0) {
        alertContainer.innerHTML = `
            <div class="alert alert-low-stock">
                ⚠️ **ATTENTION !** ${lowStockCount} produit(s) sont en stock faible.
            </div>
        `;
    } else {
        alertContainer.innerHTML = '';
    }
};


// 5. Gestion des Produits (Ajout, Modif, Suppr)

/** Fonction de calcul du coût global initial */
const calculateGlobalCost = () => {
    // Utiliser priceInput pour le coût unitaire d'achat
    const price = parseFloat(priceInput.value.replace(',', '.')) || 0;
    const quantity = parseInt(initialQuantityInput.value) || 0;
    const globalCost = price * quantity;
    globalCostInput.value = globalCost.toFixed(2);
};

// Listeners pour les nouveaux champs du formulaire produit
priceInput.addEventListener('input', calculateGlobalCost);
initialQuantityInput.addEventListener('input', calculateGlobalCost);


/** Prépare et affiche le formulaire pour l'édition ou l'ajout des métadonnées. */
const editProduct = (id = null) => {
    const products = getProducts();
    
    productForm.reset();
    productIdInput.value = '';

    if (id !== null) {
        // Mode Édition
        const product = products.find(p => p.id === id);
        if (product) {
            formTitle.innerHTML = `<i class="fas fa-edit"></i> Modifier le Produit : ${product.name}`;
            productIdInput.value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('price').value = product.price.toFixed(2);
            document.getElementById('minStockLevel').value = product.minStockLevel;
            
            // Masquer les champs de stock initial en mode édition
            initialQuantityGroup.style.display = 'none';
            globalCostGroup.style.display = 'none';
        }
    } else {
        // Mode Ajout
        formTitle.innerHTML = `<i class="fas fa-edit"></i> Ajouter un Nouveau Produit (Métadonnées)`;
        // Afficher les champs de stock initial
        initialQuantityGroup.style.display = 'block';
        globalCostGroup.style.display = 'block';
        
        // Initialiser le calcul
        priceInput.value = '0.01'; // valeur par défaut
        initialQuantityInput.value = '0';
        calculateGlobalCost(); 
    }
    
    showView('productForm');
};

/** Supprime un produit du localStorage. */
const deleteProduct = (id, name) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${name}" ? (Cela n'affecte pas les ventes/achats enregistrés)`)) {
        let products = getProducts();
        products = products.filter(p => p.id !== id);
        saveProducts(products);
        showView('list'); 
    }
};

/** Gère la soumission du formulaire d'ajout/modification. */
productForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const products = getProducts();
    const id = productIdInput.value;
    
    const name = document.getElementById('name').value.trim();
    const price = parseFloat(document.getElementById('price').value.replace(',', '.'));
    const minStockLevel = parseInt(document.getElementById('minStockLevel').value);

    // NOUVELLES VALEURS
    const initialQuantity = parseInt(initialQuantityInput.value) || 0;
    const globalCost = parseFloat(globalCostInput.value) || 0; 

    // Valide l'unicité du nom 
    if (!id && products.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert(`Erreur : Le produit "${name}" existe déjà.`);
        return;
    }
    
    if (id) {
        // Mode Édition (mise à jour des métadonnées seulement)
        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index].name = name;
            products[index].price = price;
            products[index].minStockLevel = minStockLevel;
        }
    } else {
        // Mode Création (Produit avec stock initial et enregistrement d'achat initial)
        const newProduct = {
            id: Date.now().toString(), 
            name,
            quantity: initialQuantity, 
            price, 
            minStockLevel
        };
        products.push(newProduct);

        // ENREGISTRER L'ACHAT INITIAL
        if (initialQuantity > 0 && globalCost > 0) {
            const purchases = getPurchases();
            const purchase = {
                id: Date.now().toString(),
                productId: newProduct.id,
                productName: newProduct.name,
                unitCost: price, 
                quantityBought: initialQuantity,
                totalCost: globalCost, 
                purchaseDate: new Date().toISOString(),
                supplier: 'Stock Initial (Création Produit)'
            };
            purchases.push(purchase);
            savePurchases(purchases);
        }
    }
    
    saveProducts(products); 
    showView('list'); 
});


// 6. Gestion des Achats / Entrée de Stock

/** Calcule et affiche le coût total de l'achat. */
const calculatePurchaseCost = () => {
    let unitCostString = purchaseUnitCostInput.value.replace(',', '.'); 
    const unitCost = parseFloat(unitCostString) || 0;

    const quantityBought = parseFloat(purchaseQuantityInput.value) || 0;
    
    const totalCost = unitCost * quantityBought;

    purchaseTotalCostInput.value = totalCost.toFixed(2);
};

/** Rempli le <select> du formulaire d'achat avec les produits. */
const populatePurchaseProductSelect = () => {
    const products = getProducts();
    purchaseProductSelect.innerHTML = '<option value="">-- Sélectionner un produit --</option>'; 
    
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Coût Standard: ${product.price.toFixed(2)} €)`;
        purchaseProductSelect.appendChild(option);
    });
    
    purchaseErrorDiv.style.display = 'none'; 
};

// Événement 1 : Quand on change le produit, suggère le coût standard
purchaseProductSelect.addEventListener('change', () => {
    const productId = purchaseProductSelect.value;
    const products = getProducts();
    const product = products.find(p => p.id === productId);

    if (product) {
        purchaseUnitCostInput.value = product.price.toFixed(2);
    } else {
        purchaseUnitCostInput.value = '0.00';
    }
    calculatePurchaseCost();
});

// Événement 2 : Quand on change la quantité ou le prix unitaire, recalculer le total
purchaseQuantityInput.addEventListener('input', calculatePurchaseCost);
purchaseUnitCostInput.addEventListener('input', calculatePurchaseCost); 

/** Gère la soumission du formulaire d'achat. */
purchaseForm.addEventListener('submit', (e) => {
    e.preventDefault();
    purchaseErrorDiv.style.display = 'none';

    const productId = purchaseProductSelect.value;
    const quantityBought = parseInt(purchaseQuantityInput.value);
    let unitCostString = purchaseUnitCostInput.value.replace(',', '.');
    const unitCost = parseFloat(unitCostString);
    const supplier = purchaseSupplierInput.value.trim() || 'Non spécifié';
    const totalCost = unitCost * quantityBought;


    if (!productId || quantityBought <= 0 || isNaN(quantityBought) || unitCost <= 0 || isNaN(unitCost)) {
        purchaseErrorDiv.textContent = "Veuillez vérifier le produit, la quantité et le coût unitaire (doit être un nombre valide et positif).";
        purchaseErrorDiv.style.display = 'block';
        return;
    }

    let products = getProducts();
    const productIndex = products.findIndex(p => p.id === productId);
    const product = products[productIndex];

    // 1. Enregistrement de l'Achat 
    const purchases = getPurchases();
    const purchase = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        unitCost: unitCost, 
        quantityBought: quantityBought,
        totalCost: totalCost, 
        purchaseDate: new Date().toISOString(),
        supplier: supplier
    };
    purchases.push(purchase);
    savePurchases(purchases);

    // 2. Mise à jour du Stock 
    products[productIndex].quantity += quantityBought;
    saveProducts(products);

    showView('dashboard'); 
});


// 7. Gestion des Ventes

/** Calcule et affiche le prix total de la vente. */
const calculateSalePrices = () => {
    let unitPriceString = saleUnitPriceInput.value.replace(',', '.'); 
    const unitPrice = parseFloat(unitPriceString) || 0; 

    const quantity = parseFloat(saleQuantityInput.value) || 0;
    
    const totalPrice = unitPrice * quantity;

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
        
        option.dataset.price = product.price; 

        if (product.quantity <= 0) {
            option.disabled = true;
            option.textContent += ' - Épuisé';
        }
        
        saleProductSelect.appendChild(option);
    });
    
    saleErrorDiv.style.display = 'none'; 
    saleForm.reset(); 
    
    // Réinitialiser les champs de prix/quantité et livraison
    saleUnitPriceInput.value = '0.00';
    saleTotalPriceInput.value = '0.00';
    saleQuantityInput.value = '1'; 
    saleCustomerNameInput.value = '';
    saleDeliveryAddressInput.value = '';
};

// Événement 1 : Quand on change de produit : initialise le prix unitaire
saleProductSelect.addEventListener('change', () => {
    const selectedOption = saleProductSelect.options[saleProductSelect.selectedIndex];
    
    const unitCost = selectedOption && selectedOption.dataset.price 
                      ? parseFloat(selectedOption.dataset.price) 
                      : 0;

    // Suggestion de prix de vente : coût d'achat standard * 1.5 (marge de 50%)
    saleUnitPriceInput.value = (unitCost * 1.5).toFixed(2); 
    
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
    
    let unitPriceString = saleUnitPriceInput.value.replace(',', '.');
    const unitPriceSold = parseFloat(unitPriceString);
    
    const customerName = saleCustomerNameInput.value.trim() || 'Non spécifié';
    const deliveryAddress = saleDeliveryAddressInput.value.trim() || 'Non spécifiée';


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
        saleDate: new Date().toISOString(),
        customerName: customerName,
        deliveryAddress: deliveryAddress
    };
    sales.push(sale);
    saveSales(sales);

    // 2. Mise à jour du Stock
    products[productIndex].quantity -= quantitySold;
    saveProducts(products);

    showView('dashboard'); 
});


// 8. Gestion du Rapport de Vente

/** Rend le tableau du rapport de vente. */
const renderSaleReport = () => {
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
        
        // Données de Livraison
        row.insertCell().textContent = sale.customerName;
        const displayAddress = sale.deliveryAddress.length > 30 
                             ? sale.deliveryAddress.substring(0, 30) + '...' 
                             : sale.deliveryAddress;
                             
        row.insertCell().textContent = displayAddress;
    });

    // Rendu du pied de tableau (Total)
    const totalRow = saleReportTfoot.insertRow();
    const totalHeader = document.createElement('th');
    totalHeader.colSpan = 4 + 2; 
    totalHeader.style.textAlign = 'right';
    totalHeader.textContent = 'Revenu Total Généré :';
    totalRow.appendChild(totalHeader);
    
    const revenueCell = document.createElement('th');
    revenueCell.textContent = `${totalRevenue.toFixed(2)} €`;
    totalRow.appendChild(revenueCell);
};


// 9. Gestion du Rapport d'Achat

/** Rend le tableau du rapport d'achat. */
const renderPurchaseReport = () => {
    const purchases = getPurchases().sort((a, b) => new Date(b.purchaseDate) - new Date(a.purchaseDate)); 
    purchaseReportTbody.innerHTML = '';
    purchaseReportTfoot.innerHTML = '';
    
    let totalExpenditure = 0;
    
    const reportActions = document.querySelector('.purchase-report-actions'); 
    
    if (purchases.length === 0) {
        emptyPurchasesMessage.style.display = 'block';
        if (reportActions) reportActions.style.display = 'none';
        return;
    }
    
    emptyPurchasesMessage.style.display = 'none';
    if (reportActions) reportActions.style.display = 'block';

    purchases.forEach(purchase => {
        totalExpenditure += purchase.totalCost;

        const row = purchaseReportTbody.insertRow();
        
        // Formatage de la date
        const date = new Date(purchase.purchaseDate);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        row.insertCell().textContent = formattedDate;
        row.insertCell().textContent = purchase.productName;
        row.insertCell().textContent = purchase.unitCost.toFixed(2);
        row.insertCell().textContent = purchase.quantityBought;
        row.insertCell().textContent = purchase.totalCost.toFixed(2);
        row.insertCell().textContent = purchase.supplier; // Fournisseur
    });

    // Rendu du pied de tableau (Total des dépenses)
    const totalRow = purchaseReportTfoot.insertRow();
    const totalHeader = document.createElement('th');
    totalHeader.colSpan = 4 + 1; 
    totalHeader.style.textAlign = 'right';
    totalHeader.textContent = 'Dépense Totale d\'Achat :';
    totalRow.appendChild(totalHeader);
    
    const costCell = document.createElement('th');
    costCell.textContent = `${totalExpenditure.toFixed(2)} €`;
    totalRow.appendChild(costCell);
};


// 10. Événements Globaux et Démarrage

// Boutons pour Imprimer les Rapports
document.getElementById('print-report-btn').onclick = () => { window.print(); };
document.getElementById('print-purchase-report-btn').onclick = () => { window.print(); };

// Boutons de navigation (bascule de vue)
document.getElementById('show-dashboard-btn').onclick = () => showView('dashboard');
document.getElementById('show-list-btn').onclick = () => showView('list');
document.getElementById('show-add-btn').onclick = () => editProduct(null);
document.getElementById('show-purchase-form-btn').onclick = () => showView('purchaseForm'); 
document.getElementById('show-sell-btn').onclick = () => showView('saleForm');
document.getElementById('show-report-btn').onclick = () => showView('saleReport');
document.getElementById('show-purchase-report-btn').onclick = () => showView('purchaseReport');
document.getElementById('show-about-btn').onclick = () => showView('about'); 

// Boutons d'annulation (retour à la liste ou au dashboard)
document.getElementById('cancel-form-btn').onclick = () => showView('list');
document.getElementById('cancel-sale-btn').onclick = () => showView('list');
document.getElementById('cancel-purchase-btn').onclick = () => showView('list'); 
document.getElementById('cancel-about-btn').onclick = () => showView('list'); 

// Initialisation de la vue lors du chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Par défaut, nous affichons la vue d'authentification
    authView.style.display = 'flex';
    mainAppContainer.style.display = 'none';
});
