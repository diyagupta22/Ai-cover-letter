async function generate() {

  document.getElementById("loading").innerText = "Generating... ⏳";

  const formData = new FormData();

  formData.append("name", document.getElementById("name").value);
  formData.append("role", document.getElementById("role").value);
  formData.append("company", document.getElementById("company").value);
  formData.append("jobDesc", document.getElementById("job").value);
  formData.append("resume", document.getElementById("resume").files[0]);

  try {

    const res = await fetch("/generate", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    document.getElementById("output").value = data.letter;

  } catch (err) {

    alert("Something went wrong 😥");

  }

  document.getElementById("loading").innerText = "";
}


function copyText() {

  const text = document.getElementById("output");

  text.select();
  document.execCommand("copy");

  alert("Copied! ✅");
}
