const timePeriod = document.querySelectorAll('a');

timePeriod.forEach(time => {
    time.addEventListener('click', (event) => {
        event.preventDefault();
        timePeriod.forEach(t => t.className = 'nav-link text-success');
        time.className = 'nav-link active text-success';
    });
});
