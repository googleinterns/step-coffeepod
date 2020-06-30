function dobSelect(){
    const daySelect = document.getElementById('day');
    const yearSelect = document.getElementById('year');
    for (var i = 1; i <= 31; i++){
        // appending options to month
        daySelect.appendChild(createOptionValues("day", i));
    }
    for(var i = 2020; i>= 1900; i--){
        yearSelect.appendChild(createOptionValues("year",i));
    }
}


function createOptionValues(type, num){
    const optionEl = document.createElement('option');
    optionEl.value = type+num.toString();
    optionEl.innerHTML = num.toString();
    optionEl.id = type+num.toString();
    optionEl.className = "roboto xs"
    return optionEl;
}