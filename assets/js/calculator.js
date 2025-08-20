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
        $('#value-result').text(value.toLocaleString()+".00"); // This already adds commas
        
        // Convert value to words with commas and update
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
    
    // Function to convert number to Ghana Cedis words with proper comma placement
    function convertToGhanaCedisWords(amount) {
        if (amount === 0) return 'Zero Ghana Cedis';
        
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', 'Ten', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const thousands = ['', 'Thousand', 'Million', 'Billion'];
        
        function convertThreeDigits(num, isLastChunk = false) {
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
        const chunks = [];
        
        // Break the number into chunks of three digits
        do {
            const chunk = amount % 1000;
            chunks.push({value: chunk, scale: thousands[index]});
            amount = Math.floor(amount / 1000);
            index++;
        } while (amount > 0);
        
        // Process each chunk and add commas where appropriate
        for (let i = chunks.length - 1; i >= 0; i--) {
            const chunk = chunks[i];
            if (chunk.value === 0) continue;
            
            const chunkWords = convertThreeDigits(chunk.value, i === 0);
            
            if (chunkWords) {
                let chunkResult = chunkWords;
                
                // Add scale (Thousand, Million, Billion) if applicable
                if (chunk.scale) {
                    chunkResult += ' ' + chunk.scale;
                }
                
                // Add comma if this is not the last chunk and there are more words to come
                if (words && i > 0) {
                    // Check if the next chunk has value
                    let hasNextChunk = false;
                    for (let j = i - 1; j >= 0; j--) {
                        if (chunks[j].value > 0) {
                            hasNextChunk = true;
                            break;
                        }
                    }
                    
                    if (hasNextChunk) {
                        // Add comma based on the position
                        if (i === 1) {
                            // If we're at thousands level and there are units/hundreds coming
                            words += ', ';
                        } else if (i === 2) {
                            // If we're at millions level and there are thousands/units coming
                            words += ', ';
                        } else if (i === 3) {
                            // If we're at billions level and there are millions/thousands coming
                            words += ', ';
                        }
                    }
                }
                
                words = words ? words + ' ' + chunkResult : chunkResult;
            }
        }
        
        return words + ' Ghana Cedis';
    }
    
    // Additional function to format numbers with commas (if needed elsewhere)
    function formatNumberWithCommas(number) {
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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