// fees.js - Fees and financial management section functionality
function initFeesSection() {
    const makePaymentBtn = document.getElementById('makePaymentBtn');
    const paymentFormContainer = document.getElementById('paymentFormContainer');
    const cancelPayment = document.getElementById('cancelPayment');
    const paymentForm = document.getElementById('paymentForm');
    const paymentForSelect = document.getElementById('paymentFor');
    const paymentMethodSelect = document.getElementById('paymentMethod');
    const cancelPaymentConfirm = document.getElementById('cancelPaymentConfirm');
    const confirmPaymentBtn = document.getElementById('confirmPaymentBtn');
    
    // Initialize payment button
    if (makePaymentBtn) {
        makePaymentBtn.addEventListener('click', function() {
            paymentFormContainer.style.display = 'block';
            window.scrollTo(0, paymentFormContainer.offsetTop);
        });
    }
    
    // Initialize cancel button
    if (cancelPayment) {
        cancelPayment.addEventListener('click', function() {
            paymentFormContainer.style.display = 'none';
            paymentForm.reset();
            document.getElementById('paymentDescriptionContainer').style.display = 'none';
            document.getElementById('cardFields').style.display = 'none';
            document.getElementById('upiFields').style.display = 'none';
        });
    }
    
    // Show/hide payment description field
    if (paymentForSelect) {
        paymentForSelect.addEventListener('change', function() {
            const descriptionContainer = document.getElementById('paymentDescriptionContainer');
            if (this.value === 'other') {
                descriptionContainer.style.display = 'block';
            } else {
                descriptionContainer.style.display = 'none';
            }
        });
    }
    
    // Show/hide payment method fields
    if (paymentMethodSelect) {
        paymentMethodSelect.addEventListener('change', function() {
            document.getElementById('cardFields').style.display = 'none';
            document.getElementById('upiFields').style.display = 'none';
            
            if (this.value === 'credit_card' || this.value === 'debit_card') {
                document.getElementById('cardFields').style.display = 'block';
            } else if (this.value === 'upi') {
                document.getElementById('upiFields').style.display = 'block';
            }
        });
    }
    
    // Initialize payment form
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate card details if card payment
            if (paymentMethodSelect.value === 'credit_card' || paymentMethodSelect.value === 'debit_card') {
                if (!validateCardDetails()) {
                    return;
                }
            }
            
            // Show confirmation modal
            showPaymentConfirmation();
        });
    }
    
    // Initialize confirmation modal buttons
    if (cancelPaymentConfirm) {
        cancelPaymentConfirm.addEventListener('click', function() {
            document.getElementById('paymentConfirmationModal').style.display = 'none';
        });
    }
    
    if (confirmPaymentBtn) {
        confirmPaymentBtn.addEventListener('click', function() {
            processPayment();
        });
    }
    
    // Close modal when clicking X
    document.querySelector('.close-modal').addEventListener('click', function() {
        document.getElementById('paymentConfirmationModal').style.display = 'none';
    });
}

function initFeesData(feesData, paymentHistory) {
    // Update summary
    document.getElementById('totalFeesAmount').textContent = `$${feesData.total.toFixed(2)}`;
    document.getElementById('paidFeesAmount').textContent = `$${feesData.paid.toFixed(2)}`;
    document.getElementById('dueFeesAmount').textContent = `$${feesData.due.toFixed(2)}`;
    
    // Load payment history
    loadPaymentHistory(paymentHistory);
    
    // Load upcoming payments
    loadUpcomingPayments();
}

function loadPaymentHistory(payments) {
    const paymentHistoryTable = document.getElementById('paymentHistoryTable').querySelector('tbody');
    
    if (payments.length === 0) {
        paymentHistoryTable.innerHTML = '<tr><td colspan="6" class="empty-message">No payment history found.</td></tr>';
        return;
    }
    
    paymentHistoryTable.innerHTML = '';
    
    payments.forEach(payment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${new Date(payment.date).toLocaleDateString()}</td>
            <td>$${payment.amount.toFixed(2)}</td>
            <td>${payment.transaction_id}</td>
            <td>${payment.payment_method.replace('_', ' ').toUpperCase()}</td>
            <td><span class="status ${payment.status}">${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span></td>
            <td><button class="btn-view-receipt" data-id="${payment.id}">View</button></td>
        `;
        
        paymentHistoryTable.appendChild(row);
    });
    
    // Add event listeners to view receipt buttons
    document.querySelectorAll('.btn-view-receipt').forEach(btn => {
        btn.addEventListener('click', function() {
            const paymentId = this.getAttribute('data-id');
            viewReceipt(paymentId);
        });
    });
}

function loadUpcomingPayments() {
    fetch(`php/get_upcoming_payments.php?student_id=${window.dashboardData.profile.id}`)
        .then(response => response.json())
        .then(data => {
            const upcomingPaymentsTable = document.getElementById('upcomingPaymentsTable').querySelector('tbody');
            
            if (data.length === 0) {
                upcomingPaymentsTable.innerHTML = '<tr><td colspan="5" class="empty-message">No upcoming payments.</td></tr>';
                return;
            }
            
            upcomingPaymentsTable.innerHTML = '';
            
            data.forEach(payment => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${new Date(payment.due_date).toLocaleDateString()}</td>
                    <td>$${payment.amount.toFixed(2)}</td>
                    <td>${payment.description || 'Tuition Fee'}</td>
                    <td><span class="status ${payment.status}">${payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}</span></td>
                    <td><button class="btn-pay-now" data-id="${payment.id}" data-amount="${payment.amount}">Pay Now</button></td>
                `;
                
                upcomingPaymentsTable.appendChild(row);
            });
            
            // Add event listeners to pay now buttons
            document.querySelectorAll('.btn-pay-now').forEach(btn => {
                btn.addEventListener('click', function() {
                    const paymentId = this.getAttribute('data-id');
                    const amount = this.getAttribute('data-amount');
                    
                    // Pre-fill payment form
                    document.getElementById('paymentAmount').value = amount;
                    document.getElementById('paymentFor').value = 'tuition';
                    
                    // Show payment form
                    document.getElementById('paymentFormContainer').style.display = 'block';
                    window.scrollTo(0, document.getElementById('paymentFormContainer').offsetTop);
                });
            });
        })
        .catch(error => {
            console.error('Error loading upcoming payments:', error);
        });
}

function validateCardDetails() {
    const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
    const cardExpiry = document.getElementById('cardExpiry').value;
    const cardCvv = document.getElementById('cardCvv').value;
    
    // Simple validation
    if (!/^\d{16}$/.test(cardNumber)) {
        alert('Please enter a valid 16-digit card number');
        return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
        alert('Please enter expiry date in MM/YY format');
        return false;
    }
    
    if (!/^\d{3,4}$/.test(cardCvv)) {
        alert('Please enter a valid CVV (3 or 4 digits)');
        return false;
    }
    
    return true;
}

function showPaymentConfirmation() {
    const amount = document.getElementById('paymentAmount').value;
    const paymentFor = document.getElementById('paymentFor').options[document.getElementById('paymentFor').selectedIndex].text;
    const paymentMethod = document.getElementById('paymentMethod').options[document.getElementById('paymentMethod').selectedIndex].text;
    
    const confirmationDetails = document.getElementById('paymentConfirmationDetails');
    confirmationDetails.innerHTML = `
        <p><strong>Amount:</strong> $${parseFloat(amount).toFixed(2)}</p>
        <p><strong>Payment For:</strong> ${paymentFor}</p>
        <p><strong>Payment Method:</strong> ${paymentMethod}</p>
    `;
    
    // Show card last 4 digits if card payment
    if (paymentMethod.includes('Card')) {
        const cardNumber = document.getElementById('cardNumber').value;
        confirmationDetails.innerHTML += `<p><strong>Card Number:</strong> **** **** **** ${cardNumber.slice(-4)}</p>`;
    }
    
    document.getElementById('paymentConfirmationModal').style.display = 'block';
}

function processPayment() {
    const formData = new FormData(document.getElementById('paymentForm'));
    formData.append('student_id', window.dashboardData.profile.id);
    
    // In a real implementation, you would process payment through a payment gateway
    // This is just a simulation
    fetch('php/process_payment.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Payment processed successfully!');
            document.getElementById('paymentConfirmationModal').style.display = 'none';
            document.getElementById('paymentFormContainer').style.display = 'none';
            document.getElementById('paymentForm').reset();
            
            // Reload fees data
            initFeesData(window.dashboardData.fees, window.dashboardData.payment_history);
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while processing payment');
    });
}

function viewReceipt(paymentId) {
    // In a real implementation, this would open a receipt PDF
    alert(`Viewing receipt for payment ID: ${paymentId}`);
    // window.open(`php/generate_receipt.php?payment_id=${paymentId}`, '_blank');
}