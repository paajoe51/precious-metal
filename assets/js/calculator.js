$(document).ready(function() {
    // Initialize calculator
    $('#calculate-btn').click(function() {
        calculateGold();
    });
    
    // Reset form
    $('#reset-btn').click(function() {
        resetCalculator();
    });
    
    // Save to transactions
    $('#save-btn').click(function() {
        saveToTransactions();
    });
    
    // Print calculator
    $('#print-calculator').click(function() {
        window.print();
    });
    
    // Export calculation
    $('#export-calc').click(function() {
        exportCalculation();
    });
    
    // Calculate gold values
    function calculateGold() {
        const top = parseFloat($('#top').val()) || 0;
        const down = parseFloat($('#down').val()) || 0;
        const base = parseFloat($('#base').val()) || 0;
        
        // Perform calculations
        const pounds = Math.floor(top / 7.75 * 100) / 100;
        const karat = Math.floor(top / down * 100) / 100;
        let moro = 0;
        
        if (karat >= 10.51) {
            moro = Math.floor((karat - 10.51) * 52.838 / karat * 100) / 100;
        }
        
        // Using moro in the calculation as you intended
        const value = Math.floor((base * pounds * moro) / 23);
        
        // Update results
        $('#pounds-result').text(pounds.toFixed(2));
        $('#karat-result').text(karat.toFixed(2));
        $('#moro-result').text(moro.toFixed(2));
        $('#value-result').text(value.toLocaleString());
        
        // Convert value to words and update
        const amountInWords = convertToGhanaCedisWords(value);
        $('#value-words').text(amountInWords);
        
        // Update status
        if (karat >= 10.51) {
            $('#status-result').text('Gold');
            $('#status-indicator').removeClass('status-no-gold').addClass('status-gold');
            $('#status-indicator i').removeClass('fa-times-circle').addClass('fa-check-circle text-success');
        } else {
            $('#status-result').text('No Gold');
            $('#status-indicator').removeClass('status-gold').addClass('status-no-gold');
            $('#status-indicator i').removeClass('fa-check-circle text-success').addClass('fa-times-circle');
        }
    }
    
    // Function to convert number to Ghana Cedis words
    function convertToGhanaCedisWords(amount) {
        if (amount === 0) return 'Zero Ghana Cedis';
        
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const thousands = ['', 'Thousand', 'Million', 'Billion'];
        
        function convertThreeDigits(num) {
            let result = '';
            const hundred = Math.floor(num / 100);
            const remainder = num % 100;
            
            if (hundred > 0) {
                result += units[hundred] + ' Hundred';
            }
            
            if (remainder > 0) {
                if (result !== '') result += ' and ';
                
                if (remainder < 10) {
                    result += units[remainder];
                } else if (remainder < 20) {
                    result += teens[remainder - 10];
                } else {
                    const ten = Math.floor(remainder / 10);
                    const unit = remainder % 10;
                    result += tens[ten];
                    if (unit > 0) {
                        result += '-' + units[unit];
                    }
                }
            }
            
            return result;
        }
        
        if (amount < 0) {
            return 'Negative ' + convertToGhanaCedisWords(-amount);
        }
        
        let words = '';
        let index = 0;
        
        do {
            const chunk = amount % 1000;
            if (chunk !== 0) {
                let chunkWords = convertThreeDigits(chunk);
                if (thousands[index]) {
                    chunkWords += ' ' + thousands[index];
                }
                words = chunkWords + (words ? ' ' + words : '');
            }
            amount = Math.floor(amount / 1000);
            index++;
        } while (amount > 0);
        
        return words + ' Ghana Cedis';
    }
    
    // Reset calculator
    function resetCalculator() {
        $('#top').val('143.81');
        $('#down').val('7.77');
        $('#base').val('4720');
        $('#pounds-result').text('0.00');
        $('#karat-result').text('0.00');
        $('#moro-result').text('0.00');
        $('#value-result').text('0.00');
        $('#status-result').text('No Gold');
        $('#status-indicator').removeClass('status-gold').addClass('status-no-gold');
        $('#status-indicator i').removeClass('fa-check-circle text-success').addClass('fa-times-circle');
    }
    
    // Save to transactions
    function saveToTransactions() {
        const top = $('#top').val();
        const down = $('#down').val();
        const base = $('#base').val();
        
        if (top && down && base) {
            // In a real app, this would save to a database via AJAX
            alert('Calculation saved to Transactions');
            
            // Example of what would be sent to the server
            const data = {
                top: top,
                down: down,
                base: base,
                pounds: $('#pounds-result').text(),
                karat: $('#karat-result').text(),
                moro: $('#moro-result').text(),
                value: $('#value-result').text(),
                status: $('#status-result').text(),
                date: new Date().toISOString()
            };
            
            console.log('Data to be saved:', data);
        } else {
            alert('Please fill in all input fields and calculate first');
        }
    }
    
    // Export calculation
    function exportCalculation() {
        // In a real app, this would generate a PDF or Excel file
        alert('Export functionality would generate a report here');
        
        // Example data that would be exported
        const data = {
            top: $('#top').val(),
            down: $('#down').val(),
            base: $('#base').val(),
            pounds: $('#pounds-result').text(),
            karat: $('#karat-result').text(),
            moro: $('#moro-result').text(),
            value: $('#value-result').text(),
            status: $('#status-result').text(),
            date: new Date().toLocaleString()
        };
        
        console.log('Data to be exported:', data);
    }
});