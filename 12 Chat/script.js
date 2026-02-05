let isToxic;
const threshold = 0.9;

const a = async (question) => {
  const passage = document.getElementById("inputPassage").value;
  const model = await qna.load();
  const answers = await model.findAnswers(question, passage);
  return answers;
};

$(function async() {
  var INDEX = 0;
  $("#chat-submit").click(async function (e) {
    e.preventDefault();
    let msg = $("#chat-input").val();
    if (msg.trim() == "") {
      return false;
    }
    if (msg == "hi" || msg == "Hi" || msg == "hello") {
      generate_message(msg, "self");
      setTimeout(function () {
        generate_message("Hello", "user");
      }, 1000);
      return false;
    }
    await predictPhrase(msg);
    generate_message(msg, "self");
    const result = await a(msg);
    console.log(result);
    if (result.length == 0) {
      setTimeout(function () {
        generate_message("Sorry I don't no the Answer", "user");
      }, 1000);
    } else {
      setTimeout(function () {
        generate_message(result[0].text, "user");
      }, 1000);
    }
  });

  function generate_message(msg, type) {
    INDEX++;
    let str = "";
    str += "<div id='cm-msg-" + INDEX + "' class=\"chat-msg " + type + '">';
    str += '          <span class="msg-avatar">';
    str += '            <img src="avatar.png">';
    str += "          </span>";
    str += '          <div class="cm-msg-text">';
    str += msg;
    str += "          </div>";
    str += "        </div>";
    $(".chat-logs").append(str);
    $("#cm-msg-" + INDEX)
      .hide()
      .fadeIn(300);
    if (type == "self") {
      $("#chat-input").val("");
    }
    $(".chat-logs")
      .stop()
      .animate({ scrollTop: $(".chat-logs")[0].scrollHeight }, 1000);
  }

  $(document).delegate(".chat-btn", "click", function () {
    let value = $(this).attr("chat-value");
    let name = $(this).html();
    $("#chat-input").attr("disabled", false);
    generate_message(name, "self");
  });

  $("#chat-circle").click(function () {
    $("#chat-circle").toggle("scale");
    $(".chat-box").toggle("scale");
  });

  $(".chat-box-toggle").click(function () {
    $("#chat-circle").toggle("scale");
    $(".chat-box").toggle("scale");
  });
});

async function predictPhrase(inputPhrase) {
  toxicity.load(threshold).then((model) => {
    const sentences = [inputPhrase];
    model.classify(sentences).then((predictions) => {
      isToxic = predictions[predictions.length - 1].results[0].match;
    });
    if (isToxic == true) {
      document.getElementById("toxic").style.display = "block";
      document.getElementById(
        "toxic"
      ).innerHTML = `Toxic Message Detected in Text: "${inputPhrase}"`;
      console.log(`Toxic Message Detected in Text: "${inputPhrase}"`);
    } else {
      console.log(`Non Toxic Message: "${inputPhrase}"`);
      document.getElementById("toxic").style.display = "none";
    }
  });
}
