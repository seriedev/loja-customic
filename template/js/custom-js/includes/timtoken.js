    
    $html =
    "*Pedidos finalizados até as 15h são enviados no mesmo dia com prazo de entrega no dia útil seguinte.<br/>*Pedidos finalizados após as 15h serão enviados no dia seguinte, com prazo de entrega de 2 dias úteis da data da compra.";
    $cookieName = "TimCampaign";
    $untilTomorrow = false;
  // =====================
  // Contador de tempo restante
  // =====================
    var now = new Date();
    var end = new Date();
    end.setHours(15,0,0,0);
    function diff_hours(dt2, dt1) 
    {

      var diff =(dt2.getTime() - dt1.getTime()) / 1000;
      diff /= (60 * 60);
      return Math.abs(Math.round(diff));
     
    }
    var $remaining = new Date(end - now);
    var $remainingHours = diff_hours(now,end);
    var $remainingMinutes = $remaining.getMinutes();
    if ($remainingMinutes < 0) $remainingMinutes * -1;
    

    $hourConnector = $remainingHours > 1 ? "nas próximas" : "na próxima";
    if ($remainingHours == 0) $hourConnector = "dentro de";
    // =======================

    // Textos para o fechamento
    let $twoDays = false;
    let $finishingText = "";
    var $quandoentrega = "Até Amanhã";
    // Texto do fim de semana
    function weekendText() {
      let textPrazo = "";
      if (now.getDay() === 5 || now.getDay() === 6 || now.getDay() === 0) {
        textPrazo = "Segunda-feira"
      }else if(now.getHours() > 14){
        textPrazo = "Até 2 dia úteis"
      }else{
        textPrazo = "Até Amanhã"
      }
      $finishingText = textPrazo
      $quandoentrega = textPrazo;
    }

    if (now.getHours() > 14 && now.getMinutes() > 0) {
      let tomorrow = new Date()
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(15,0,0,0);
      $remaining = new Date(tomorrow - now);
      $remainingHours = diff_hours(tomorrow,now)
      if ($remainingHours == 24) $remainingHours -= 1;
      $string = $remainingHours +"h "+$remaining.getMinutes()+"min";
      $twoDays = true;
      $finishingText = "Até 2 dia úteis"
      weekendText();
      $html = $quandoentrega +"<br class='imutable'><span>Se pedir dentro de <br><b class='green'>"+$string+"</b></span>";
    }else{
      $string = $hourConnector+"<br><b class='green'>"+ $remainingHours +"h "+$remainingMinutes+"min</b>";
      $twoDays = false;
      $finishingText = $quandoentrega;
      $untilTomorrow = true;
      weekendText();
      $html = $quandoentrega+"<br class='imutable'><span>Se pedir "+$string+"</span>";
    }

    function setCookie(name, value, days = 0.5) {
        const d = new Date();
        d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
        let expires = "expires="+d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
    }
    function getCookie(cname) {
        let name = cname + "=";
        let ca = document.cookie.split(';');
        for(let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == ' ') {
            c = c.substring(1);
          }
          if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
          }
        }
        return "";
    }
    function eraseCookie(name) {
        document.cookie = name + "=" + null + ";Expires=Thu, 01 Jan 1970 00:00:01 GMT;path=/";
    }
    
  // =====================
  // Funções
  // =====================

  function changeSedex() {
    // Troca o texto do Sedex;
      setTimeout(() => {
        if ($(".list-group").length > 0) {
          $(".list-group > a").each(function (index, element) {
            $list = $(this);
            $text = $list.find("small").text();
            if ($text == "SEDEX") {
              $list.find(".shipping-line>strong:first-child").html($html);
              $list.attr("sedex-tim", true);
            }
          });
        }
      }, 100);
  }

  // Mutation para observar as mudanças na tabela
  function MutationSedex() {
    // Opções
    let elementToObserve = $(".shipping-calculator__services > span")[0];
    let configs = { childList: true,subtree : false };
    if (window.location.href.toUpperCase().indexOf("CHECKOUT") > 0) {
       elementToObserve = $(".col .checkout > span")[0];
       configs = { childList: true,subtree : false };
    }
    // Defs
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        changeSedex();
      });
    });
    // Exec
    if (elementToObserve != undefined) {
      observer.observe(elementToObserve, configs);
      if (window.location.href.toUpperCase().indexOf("CHECKOUT") > 0) {
        observer.disconnect;
      }
    }
  }
  
$(function () {


  // =====================
  // Execs
  // =====================
  // Pagina de carrinho
  if (window.location.href.indexOf("utm_campaign=tim1") > 0 || getCookie($cookieName) != '') {
      $("body").addClass("tokenTim_page");
    if (window.location.href.toUpperCase().indexOf("CHECKOUT") < 0) {
      setCookie($cookieName, "true", 1);
          if ($("#spa").length > 0) {
            if ($(".shipping-calculator__services")[0] === undefined) {
              var checkExist = setInterval(function () {
                if ($(".shipping-calculator__services").length) {
                  clearInterval(checkExist);
                  MutationSedex();
                }
              }, 100);
            } else {
              MutationSedex();
            }
          }
    }

  }
  // Pagina de Pagamento
  if (getCookie($cookieName) != '') {
    // if (window.location.href.indexOf("checkout") > 0) {
        var checkExist = setInterval(function () {
          if ($(".checkout__shipping").length > 0) {
            if (window.location.href.indexOf("checkout") > 0){
              clearInterval(checkExist);
              CheckoutSedex();
            }
          }
        }, 100);

        function CheckoutSedex() {
          const elementToObserve = $(".checkout__app")[0];
          const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
              var checkExist = setInterval(function () {
                if ($(".checkout__shipping").length > 0) {
                  clearInterval(checkExist);
                  MutationSedex();
                }
              }, 100);

            });
          });
          observer.observe(elementToObserve, { childList: false,attributes:true,subtree : false });
        }
  }


  // Limpa o cookie quando confirma o pedido
  if (window.location.href.indexOf("/confirmation/") > 0){
    var checkExist = setInterval(function () {
      if ($("#confirmation .shipping-line>strong").length > 0) {
        clearInterval(checkExist);
        $(".shipping-line>strong").text($finishingText)
      }
    }, 150);

    eraseCookie($cookieName)
  }
});

// Valor na opção sedex quando carrega o checkout com uma opção selecionada
var checkExist = setInterval(function () {
  if ($(".checkout__shipping-method").length > 0) {
    clearInterval(checkExist);
    if (getCookie($cookieName) != '') {
      if (window.location.href.indexOf("checkout") > 0) {
        if ($(".checkout__shipping-method").length > 0) {
          if ($(".checkout__shipping-method > small").text() == "SEDEX") {
            $text = $untilTomorrow ? "Até amanha" : "2 dias uteis";
            $(".checkout__shipping-method .shipping-line strong.mr-2").text($text);
            $(".checkout__shipping .btn").click(function (e) { 
              e.preventDefault();
              setTimeout(() => {
                changeSedex();
                MutationSedex();
              }, 250);
            });
          }
        }
      }
    }
  }
}, 250);
