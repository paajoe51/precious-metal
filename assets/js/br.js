document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('gold-calculation-form');
    const calculateBtn = document.getElementById('calculate-btn');
    const saveBtn = document.getElementById('save-btn');
    
    calculateBtn.addEventListener('click', function() {
        const top = parseFloat(document.getElementById('top').value);
        const down = parseFloat(document.getElementById('down').value);
        const base = parseFloat(document.getElementById('base').value);
        
        if (isNaN(top) || isNaN(down) || isNaN(base)) {
            alert('Please enter valid numbers for all fields');
            return;
        }
        
        // Perform calculations
        const pounds = GoldCalculator.calculatePounds(top);
        const karat = GoldCalculator.calculateKarat(top, down);
        const moro = GoldCalculator.calculateMoro(karat);
        const value = GoldCalculator.calculateValue(base, pounds, karat);
        const status = GoldCalculator.determineStatus(karat);
        
        // Update results
        document.getElementById('pounds-result').textContent = pounds.toFixed(2);
        document.getElementById('karat-result').textContent = karat.toFixed(2);
        document.getElementById('moro-result').textContent = moro.toFixed(2);
        document.getElementById('value-result').textContent = value.toLocaleString();
        document.getElementById('status-result').textContent = status;
        
        // Visual feedback
        document.getElementById('status-result').className = 
            status === "Gold" ? "result-group highlight gold" : "result-group highlight no-gold";
    });
    
    saveBtn.addEventListener('click', function() {
        // In a real app, this would save to a database or storage
        // For now, we'll just show a message
        alert('Calculation saved to Total Buy Receipt (TBR)');
    });
});