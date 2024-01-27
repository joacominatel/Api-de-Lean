// alert('Holis!');
document.getElementById('dark-mode-switch').addEventListener('click', function() {
    let nav = document.getElementsByTagName('nav')[0];
    let li = nav.getElementsByTagName('li');

    document.body.classList.toggle('dark');
    nav.classList.toggle('dark');
    
    for (let i = 0; i < li.length; i++) {
        li[i].classList.toggle('dark');
    }

    // console.log('click')
    if (document.body.classList.contains('dark')) {
        localStorage.setItem('dark-mode', 'true');    
    } else {
        localStorage.setItem('dark-mode', 'false');
    }
})

if (localStorage.getItem('dark-mode') === 'true') {
    document.body.classList.add('dark');
    document.getElementsByTagName('nav')[0].classList.add('dark');
    let li = document.getElementsByTagName('nav')[0].getElementsByTagName('li');
    for (let i = 0; i < li.length; i++) {
        li[i].classList.add('dark');
    }
}