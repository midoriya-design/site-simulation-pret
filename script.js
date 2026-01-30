// script.js

// --- 1. Attendre que le document HTML soit complètement chargé ---
// C'est une bonne pratique pour s'assurer que tous nos éléments existent avant de les manipuler.
document.addEventListener('DOMContentLoaded', function() {
    // --- AXE 3 : Fonction de Sauvegarde Indépendante ---

function saveSimulation() {
    const amountInput = document.getElementById('amount');
    const rateInput = document.getElementById('rate');
    const durationInput = document.getElementById('duration');
    const resultsDiv = document.getElementById('results');

    // Vérification de sécurité
    if (amountInput && rateInput && durationInput) {
        const currentData = {
            amount: amountInput.value,
            rate: rateInput.value,
            duration: durationInput.value,
            resultsVisible: (resultsDiv && resultsDiv.style.display !== 'none')
        };
        localStorage.setItem('loanSimulationData', JSON.stringify(currentData));
    }
}

// --- Gestion de la Restauration au chargement ---

// On vérifie si les éléments de la page de simulation existent
if (document.getElementById('loan-form')) {
    
    const savedData = localStorage.getItem('loanSimulationData');

    if (savedData) {
        try {
            const data = JSON.parse(savedData);
            
            // On remplit les champs
            const amountInput = document.getElementById('amount');
            const rateInput = document.getElementById('rate');
            const durationInput = document.getElementById('duration');

            if (amountInput) amountInput.value = data.amount;
            if (rateInput) rateInput.value = data.rate;
            if (durationInput) durationInput.value = data.duration;

            // Si les résultats étaient visibles, on relance tout
            if (data.resultsVisible) {
                // On appelle calculateLoan pour tout recalculer et afficher
                if (typeof calculateLoan === 'function') {
                    calculateLoan();
                }
            }
        } catch (e) {
            console.error("Erreur lors de la restauration", e);
        }
    }

    // --- Ajout de la sauvegarde sur le bouton Calculer ---
    
    // On récupère le bouton
    const calcBtn = document.getElementById('calculate-btn');
    
    // On ajoute notre fonction de sauvegarde à son événement clic
    if (calcBtn) {
        calcBtn.addEventListener('click', function() {
            // On attend un petit peu que le calcul soit fait avant de sauvegarder
            setTimeout(saveSimulation, 100);
        });
    }
    
    // --- Ajout de la sauvegarde sur le bouton Effacer (si vous l'ajoutez) ---
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            localStorage.removeItem('loanSimulationData');
            // Le reset du formulaire se fera par votre code existant ou ici :
            document.getElementById('loan-form').reset();
            document.getElementById('results').style.display = 'none';
        });
    }
}
    // Fonction sûre pour formater les nombres en devise
function formatCurrency(value) {
    if (typeof value !== 'number' || isNaN(value)) {
        return '---';
    }
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(value);
}

    // --- 2. Sélectionner les éléments du DOM dont nous avons besoin ---
    const loanForm = document.getElementById('loan-form');
    const resultsSection = document.getElementById('results');
    const monthlyPaymentSpan = document.getElementById('monthly-payment');
    const totalInterestSpan = document.getElementById('total-interest');
    const totalRepaymentSpan = document.getElementById('total-repayment');
    const amortizationTableBody = document.getElementById('amortization-body');

    if (loanForm) {

        // --- 3. Écouter l'événement de soumission du formulaire ---
        loanForm.addEventListener('submit', function(event) {
            // Empêcher le comportement par défaut du formulaire (qui est de recharger la page)
            event.preventDefault(); 
            document.getElementById('loader').style.display = 'block';

            const principal = parseFloat(document.getElementById('amount').value);
            const annualRate = parseFloat(document.getElementById('rate').value);
            const years = parseFloat(document.getElementById('duration').value);

            // --- 5. Effectuer les calculs ---
            const monthlyRate = annualRate / 100 / 12; // Taux mensuel
            const numberOfPayments = years * 12; // Nombre total de mensualités

            // Formule du calcul de la mensualité (annuité constante)
            const monthlyPayment = principal * 
                (monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                (Math.pow(1 + monthlyRate, numberOfPayments) - 1);

            const totalRepayment = monthlyPayment * numberOfPayments;
            const totalInterest = totalRepayment - principal;

            // --- 6. Afficher les résultats dans la page ---
            // Arrondir les résultats pour un affichage propre (2 décimales)
            monthlyPaymentSpan.textContent = formatCurrency(monthlyPayment);
            totalInterestSpan.textContent = formatCurrency(totalInterest);
            totalRepaymentSpan.textContent = formatCurrency(totalRepayment);

            // --- 7. Générer le tableau d'amortissement ---
            let remainingBalance = principal;
            amortizationTableBody.innerHTML = ''; // Vider le tableau avant de le remplir

            for (let i = 1; i <= numberOfPayments; i++) {
                const interestPayment = remainingBalance * monthlyRate;
                const principalPayment = monthlyPayment - interestPayment;
                

            const ctx = document.getElementById('loanChart').getContext('2d');

            if (window.loanChartInstance) {
                window.loanChartInstance.destroy();
            }

            window.loanChartInstance = new Chart(ctx, {
                type:'doughnut',
                data: {
                    labels: ['Capitale', 'Interessi Totali'],
                    datasets: [{
                        label: 'Importo',
                        data: [principal, totalInterest],
                        backgroundColor: [
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ],

                        borderColor: [
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 0.8)'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    let label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    if (context.parsed !== null) {
                                        label += new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR'}).format(context.parsed);
                                    }
                                    return label;
                                }
                            }
                        }
                    }
                }
            })

            document.getElementById('loader').style.display = 'none';

            resultsSection.style.display = 'block';

            
            // --- 4. Récupérer les valeurs des champs du formulaire ---
           
                // Arrondir pour éviter les erreurs de cumul
                const roundedInterest = formatCurrency(interestPayment);
                const roundedPrincipal = formatCurrency(principalPayment);
                
                remainingBalance -= principalPayment;
                const roundedRemainingBalance = formatCurrency(remainingBalance);

                // Créer une nouvelle ligne dans le tableau
                const row = document.createElement('tr');
                row.innerHTML = `
                   <th scope="row">${i}</th>
                   <td>${formatCurrency(monthlyPayment)}</td>
                   <td>${roundedInterest}</td>
                   <td>${roundedPrincipal}</td>
                   <td>${(i === numberOfPayments) ? '0.00' : roundedRemainingBalance}</td>
                `;

                amortizationTableBody.appendChild(row);
            }

            // --- 8. Rendre la section des résultats visible ---
            resultsSection.style.display = 'block';
            setTimeout(() => resultsSection.classList.add('visible'), 10);
        });

    } // NOUVEAU : Fermer la condition if

});
// --- Script pour la page de contact ---

// Sélectionne le formulaire de contact par son ID
const contactForm = document.getElementById('contact-page-form');

// La condition suivante ne s'exécutera que si le formulaire a été trouvé
if (contactForm) {
    const successMessage = document.getElementById('form-success-message');

    contactForm.addEventListener('submit', function(event) {
        // Empêcher le rechargement de la page
        event.preventDefault();

        // Cacher le formulaire
        contactForm.style.display = 'none';

        // Afficher le message de succès
        successMessage.style.display = 'block';
        setTimeout(() => successMessage.classList.add('visible'), 10);
    });
}

// --- Script pour la page de demande de prêt (version finale corrigée) ---

const loanRequestForm = document.getElementById('loan-request-form');

if (loanRequestForm) {
    // Sélectionne le bouton en utilisant sa CLASS, pas son ID
    const submitButton = document.querySelector('.submit-button');

    // Sélectionner les messages
    const successMessage = document.getElementById('form-success-message');
    const errorMessage = document.getElementById('form-error-message');

    // Fonction pour vérifier si le formulaire est valide
    function checkFormValidity() {
        // Si le bouton n'existe pas, on ne fait rien (sécurité)
        if (!submitButton) return;

        const requiredFields = loanRequestForm.querySelectorAll('[required]');
        let isFormValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
                isFormValid = false;
            }
        });

        // Activer ou désactiver le bouton
        submitButton.disabled = !isFormValid;
    }

    // Ajouter les écouteurs pour vérifier en temps réel
    loanRequestForm.addEventListener('input', checkFormValidity);
    loanRequestForm.addEventListener('change', checkFormValidity);

    // --- LOGIQUE DE SOUMISSION ---
    loanRequestForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // Masquer les anciens messages
        if (errorMessage) errorMessage.style.display = 'none';
        if (successMessage) successMessage.style.display = 'none';
        
        // Afficher le message de succès
        loanRequestForm.style.display = 'none';
        if (successMessage) {
            successMessage.style.display = 'block';
            setTimeout(() => successMessage.classList.add('visible'), 10);
        }
    });
}     

function handleScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    reveals.forEach(element => {
        const windowHeight = window.innerHeight;
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

         if (elementTop < windowHeight - elementVisible) {
            element.classList.add('active');  
        } else {

        }
    });    
}

window.addEventListener('load', handleScrollReveal);
window.addEventListener('scroll', handleScrollReveal);

document.addEventListener('click', function(e) { 
    const wrapper = e.target.closest('.button-wrapper');
    if (!wrapper) return;
    const button = wrapper.querySelector('button, a');
    if (!button) return;
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';

    wrapper.appendChild(ripple);

     setTimeout(() => {
        ripple.remove();
     }, 600); 
})

function navigateWidthTransition(url) {
    const transitionLayer = document.querySelector('.page-transition');
    if (transiLayer) {
        transitionLayer.classList.add('active');
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    } else {

    }
}

window.addEventListener('load', function(){
    const transitionLayer = document.querySelector('.page-transition');
    if (transitionLayer) {
        setTimeout(() => {
            transitionLayer.classList.remove('active');
        }, 50);
    }
    
});