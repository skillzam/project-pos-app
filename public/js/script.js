function updatePrice() {
  const itemSelect = document.getElementById("item");
  const selectedOption = itemSelect.options[itemSelect.selectedIndex];
  const price = selectedOption.getAttribute("data-price");
  document.getElementById("price").value = price;
}

// Set initial price on page load
window.onload = updatePrice;
