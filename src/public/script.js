let tagButtons = document.querySelectorAll(".tag")

let selectedTags = []

tagButtons.forEach((button) => {
  button.addEventListener("click", () => {
    let tag = button.dataset.tag

    if (selectedTags.includes(tag)) {
      selectedTags = selectedTags.filter((t) => t !== tag)
      button.classList.remove("selected")
    } else {
      selectedTags.push(tag)
      button.classList.add("selected")
    }

    updateTools()
  })
})

function updateTools() {
  let tools = document.querySelectorAll(".tool")

  let number = 0;

  tools.forEach((tool) => {
    let toolTags = tool.dataset.tags.split(",")

    if (selectedTags.every((tag) => toolTags.includes(tag))) {
      tool.classList.remove("hidden")
      number++;
    } else {
      tool.classList.add("hidden")
    }
  })

  document.getElementById("toolNumber").innerHTML = `${number} outil${number > 1 ? "s" : ""}`;
}