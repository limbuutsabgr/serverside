function addMp(event){
  event.preventDefault();
  var h3 = document.createElement('h3');
  if(document.getElementById("number_mp").value>0){
    h3.textContent = document.getElementById("label_mp").innerText + document.getElementById("number_mp").value;
    document.getElementById("add").append(h3);
    document.getElementById("button_mp").disabled = true;
  }
}

function addInvisibility(event){
  event.preventDefault();
  var h3 = document.createElement('h3');
  if(document.getElementById("number_invisibility").value>0){
    h3.textContent = document.getElementById("label_invisibility").innerText + document.getElementById("number_invisibility").value;
    document.getElementById("add").append(h3);
    document.getElementById("button_invisibility").disabled = true;
  }
}

function addSpellbook(event){
  event.preventDefault();
  var h3 = document.createElement('h3');
  if(document.getElementById("number_spellbook").value>0){
    h3.textContent = document.getElementById("label_spellbook").innerText + document.getElementById("number_spellbook").value;
    document.getElementById("add").append(h3);
    document.getElementById("button_spellbook").disabled = true;
  }
}

function addBroom(event){
  event.preventDefault();
  var h3 = document.createElement('h3');
  if(document.getElementById("number_broom").value>0){
    h3.textContent = document.getElementById("label_broom").innerText + document.getElementById("number_broom").value;
    document.getElementById("add").append(h3);
    document.getElementById("button_broom").disabled = true;
  }
}

function addCrystal(event){
  event.preventDefault();
  var h3 = document.createElement('h3');
  if(document.getElementById("number_crystal").value>0){
    h3.textContent = document.getElementById("label_crystal").innerText + document.getElementById("number_crystal").value;
    document.getElementById("add").append(h3);
    document.getElementById("button_crystal").disabled = true;
  }
}
