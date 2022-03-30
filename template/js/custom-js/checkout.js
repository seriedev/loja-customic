
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
    // =======================

    if (now.getHours() > 14 && now.getMinutes() > 0) {
      let tomorrow = new Date()
      tomorrow.setDate(now.getDate() + 1);
      tomorrow.setHours(15,0,0,0);
      $remaining = new Date(tomorrow - now);
      $string = (diff_hours(tomorrow,now)) +"h "+$remaining.getMinutes()+"min";
      $html = "Até 2 dia úteis<br class='imutable'><span>Se pedir dentro de <br><b class='green'>"+$string+"</b></span>";
    }else{
      $string = $hourConnector+"<br><b class='green'>"+ $remainingHours +"h "+$remainingMinutes+"min</b>";
      $html = "Até Amanhã<br class='imutable'><span>Se pedir "+$string+"</span>";
      $untilTomorrow = true;
    }
    function setCookie(name, value, days) {
      sessionStorage.setItem(name, value);
    }
    function getCookie(name) {
      return sessionStorage.getItem(name);
    }
    function eraseCookie(name) {
      sessionStorage.removeItem(name);
    }
    
  // =====================
  // Funções
  // =====================

  function changeSedex() {

    function defaultReplace() {
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
      }, 250);
    }
    if (window.location.href.indexOf("cart") > 0) {
      defaultReplace();
    } else {
      defaultReplace();
    }
  }
  function MutationSedex() {
    const elementToObserve = $(".shipping-calculator__services")[0];
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        changeSedex();
      });
    });
    if (elementToObserve != undefined) {
      observer.observe(elementToObserve, { childList: true,subtree : true });
    }
  }
  
$(function () {


  // =====================
  // Execs
  // =====================
  // Pagina de carrinho
  if (window.location.href.indexOf("utm_campaign=tim1") > 0 || getCookie($cookieName) != null) {
    setCookie($cookieName, "true", 1);
//    console.log("Phase 1");
    if ($("#spa").length > 0) {
//      console.log("Phase 2");
      if ($(".shipping-calculator__services")[0] === undefined) {
//        console.log("Phase 2.3");
        var checkExist = setInterval(function () {
          if ($(".shipping-calculator__services").length) {
            clearInterval(checkExist);
//            console.log("Phase 2.4");
            MutationSedex();
          }
        }, 100);
      } else {
//        console.log("Phase 2.2");
        MutationSedex();
      }
    }
  }
  // Pagina de Pagamento
  if (getCookie($cookieName) != null) {
    // if (window.location.href.indexOf("checkout") > 0) {
        console.log("É checkout");
        var checkExist = setInterval(function () {
          if ($(".checkout__shipping").length > 0) {
            if (window.location.href.indexOf("checkout") > 0){
              clearInterval(checkExist);
              CheckoutSedex();
            }
          }
        }, 100);

        function CheckoutSedex() {
          // console.log("Tabela existe");
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



    // }
  }


  // Limpa o cookie quando confirma o pedido
  if (window.location.href.indexOf("/confirmation/") > 0){
    eraseCookie($cookieName)
  }
});

// Valor na opção sedex quando carrega o checkout com uma opção selecionada
var checkExist = setInterval(function () {
  if ($(".checkout__shipping-method").length > 0) {
    clearInterval(checkExist);
    if (getCookie($cookieName) != null) {
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
              }, 500);
            });
          }
        }
      }
    }
  }
}, 1000);