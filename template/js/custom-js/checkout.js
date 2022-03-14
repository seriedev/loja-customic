$(function () {
    $html =
    "*Pedidos finalizados até as 15h são enviados no mesmo dia com prazo de entrega no dia útil seguinte.<br/>*Pedidos finalizados após as 15h serão enviados no dia seguinte, com prazo de entrega de 2 dias úteis da data da compra.";
    $cookieName = "TimCampaign";

    // =======================
    var now = new Date();
    var end = new Date();
    end.setHours(15,0,0,0);

    // end.setHours(21,0,0,0);
    // now.getUTCHours();
    // end.getUTCHours();
    
    var $remaining = new Date(end - now);
    var $remainingString = $remaining.getHours() + ":"+ $remaining.getMinutes();

    $hourConnector = $remaining.getHours() > 1 ? "nas próximas" : "na próxima";
    // =======================

    if (now.getHours() >= 15 && now.getMinutes() > 0) {
      let tomorrow = new Date()
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(15,0,0,0);
      $remaining = new Date(tomorrow - now);
      // console.log($remaining.getHours() + 3,$remaining.getMinutes())
      $string = ($remaining.getHours() + 3) +"h "+$remaining.getMinutes()+"min";
      $html = "Até 2 dia úteis<br><span>Se pedir dentro de <br><b class='green'>"+$string+"</b></span>";
    }else{
      $string = $hourConnector+"<br><b class='green'>"+ $remaining.getHours() +"h "+$remaining.getMinutes()+"min</b>";
      $html = "Até Amanhã<br><span>Se pedir "+$string+"</span>";
    }


  function setCookie(name, value, days) {
    var expires = "";
    if (days) {
      var date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
  }
  function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) == " ") c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }
  function eraseCookie(name) {
    document.cookie =
      name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  }
  function changeSedex() {

    function defaultReplace() {
      setTimeout(() => {
        if ($(".list-group").length > 0) {
          $(".list-group > a").each(function (index, element) {
            // element == this
            $list = $(this);
            $text = $list.find("small").text();
            if ($text == "SEDEX") {
              $list.find(".shipping-line>strong:first-child").html($html);
              $list.attr("sedex-tim", true);
            }
          });
        }
      }, 250);
    }
    if (window.location.href.indexOf("cart") > 0) {
      defaultReplace();
    } else {
      if ($(".checkout__shipping").length > 0) {
          defaultReplace();
      } else {
        const elementToObserve = $(".checkout__shipping")[0];
        const observer = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            defaultReplace();
          });
        });
        observer.observe(elementToObserve, { childList: true,subtree : true });
      }
    }
  }
  function MutationSedex() {
    const elementToObserve = $(".shipping-calculator__services")[0];
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        changeSedex();
      });
    });
    observer.observe(elementToObserve, { childList: true,subtree : true });
  }
  $cookieName = "TimCampaign";

  if (window.location.href.indexOf("utm_campaign=tim") > 0) {
    setCookie($cookieName, "true", 1);
    // Campanha Tim
    console.log("Campanha Tim");
    console.log($(".shipping-calculator__services")[0]);

    // Detalhe do carrinho
    if (window.location.href.indexOf("cart") > 0) {
      if ($(".shipping-calculator__services")[0] === undefined) {
        var checkExist = setInterval(function () {
          if ($(".shipping-calculator__services").length) {
            clearInterval(checkExist);
            MutationSedex();
          }
        }, 100); // check every 100ms
      } else {
        MutationSedex();
      }
    }
  }
  // Pagamento
  if (getCookie($cookieName) != null) {
    if (window.location.href.indexOf("checkout") > 0) {
      var checkExist = setInterval(function () {
        if ($(".shipping-calculator__services .list-group").length > 0) {
          setTimeout(() => {
            var checkExist2 = setInterval(function () {
                if ($(".shipping-calculator__services .list-group").length > 0) {
                    changeSedex();
                    clearInterval(checkExist2);
                }
            });
          }, 1000);

          clearInterval(checkExist);
        }
      }, 100); // check every 100ms
    }
  }

  if (window.location.href.indexOf("/confirmation/") > 0){
    eraseCookie($cookieName)
  }
});

// window.onload = function () {};
