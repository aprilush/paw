$(function() {

  function create_from_fields(nid, nlabel, nprovtype, nimg) {
    var div = $("<div class='button'></div>");
    div.html("<input type='image' id='"+nid+"' title='"+nlabel+"' provtype='"+nprovtype+"' src='"+nimg+"' />");
    $("div[class='layer'] > div[class='banner']").filter(function(index) { 
      return ((nprovtype=="entity" && $(this).text()=="WHAT") || 
              (nprovtype=="agent" && $(this).text()=="WHO") || 
              (nprovtype=="activity" && $(this).text()=="HOW"))  
    }).map(function(index) {
      $(this).parent().append(div);
    });
  };

  function create_from_url(link) {
    console.log(link);
    $.ajax({
      url: link,
      headers: { 
        Accept : "text/json, application/ld+json", 
        "Content-Type": "text/json, application/ld+json" 
      },
      success: function(data) {
        var ents = data['entity'];
        var ags = data['agent'];
        var acts = data['activity'];
        var bg = 0xff0000;
        var fg = 0xffffff;
        for (ent in ents) {
          var logo = "http://dummyimage.com/32/"+bg.toString(16)+"/"+fg.toString(16)+".png&text="+ent;
          create_from_fields(ent, ent, "entity", logo);
          bg = Math.floor(Math.random()*16000000);
        }
        for (ag in ags) {
          var logo = "http://dummyimage.com/32/"+bg.toString(16)+"/"+fg.toString(16)+".png&text="+ent;
          console.log(logo);
          create_from_fields(ag, ag, "agent", logo);
          bg = Math.floor(Math.random()*16000000);
        }
        for (act in acts) {
          var logo = "http://dummyimage.com/32/"+bg.toString(16)+"/"+fg.toString(16)+".png&text="+ent;
          console.log(logo);
          create_from_fields(act, act, "activity", logo);
          bg = Math.floor(Math.random()*16000000);
        }
      }
    });
  }

  function copy_button(id) {
    return $('input').filter(function(index) {
      if ($(this).attr("id")==id) {
        return $(this);
      }
    }).first().closest("div").clone().removeClass("selected");
  };

  function annotate() {
    console.log("anno");
    if ($.things) {
      $.things.length = 0;
    } else {
      $.things = [];
    }
    if ($.activities) {
      $.activities.length = 0;
    } else {
      $.activities = [];
    }
    if ($.agents) {
      $.agents.length = 0;
    } else {
        $.agents = [];
    }
    $("input").filter(function(index) {
      return $(this).closest("div").hasClass("selected");
    }).map(function(index) {
      if ($(this).attr("provtype")=="entity") {
        $.things.push($(this).attr("id"));
      } else if ($(this).attr("provtype")=="activity") {
        $.activities.push($(this).attr("id"));
      } else if ($(this).attr("provtype")=="agent") {
        $.agents.push($(this).attr("id"));
      }  
    });
    if ($.rels) {
      console.log("rels exists, truncating");
      $.rels.length = 0;
    } else {
      $.rels = [];
    }
    var poss_div = $("div").filter(function(index) {return $(this).hasClass("possible");}).first();
    while (poss_div.children().size()>1) {
      poss_div.children().last().remove();
    }
    possible_links();
    if ($.rels.length > 0) {
      console.log($.rels);
      $("div").filter(function(index) {return $(this).hasClass("possible hidden");}).removeClass("hidden");
      $.each($.rels, function(i, stat) {
        div1 = copy_button(stat[0]);
        div2 = copy_button(stat[2]);
        poss_div.append("<div class='relation' style='clear:left'><input type='checkbox' value='"+i+"'>Keep!</input></div>");
        poss_div.append(div1);
        poss_div.append("<div class='relation'>"+stat[1]+"</div>");
        poss_div.append(div2);
      });
    } else {
      $("div").filter(function(index) {return $(this).hasClass("possible hidden");}).addClass("hidden");
    }
  };

  function possible_links() {
    $.each($.things, function(i1, e1) {
      $.each($.things, function(i2, e2) {
        if (i1!=i2) {
          $.rels.push([e1, "wasDerivedFrom", e2]);
        }
      })
      $.each($.activities, function(i2, a1) {
        $.rels.push([e1, "wasGeneratedBy", a1]);
        $.rels.push([a1, "used", e1]);
      }) 
      $.each($.agents, function(i2, ag1) {
        $.rels.push([e1, "wasAttributedTo", ag1]);
      })
    })
    $.each($.activities, function(i1, a1) {
      $.each($.activities, function(i2, a2) {
        if (i1 != i2) {
          $.rels.push([a1, "wasInformedBy", a2]);
        }
      }) 
      $.each($.agents, function(i2, ag1) {
        $.rels.push([a1, "wasAssociatedWith", ag1]);
      })
    })
    $.each($.agents, function(i1, ag1) {
      $.each($.agents, function(i2, ag2) {
        if (i1 != i2) {
          $.rels.push([ag1, "actedOnBehalfOf", ag2]);
        }
      })
    })
  };

  function save_relations() {
    console.log("save");
    var saved = [];
    $.each($("input[type='checkbox']").filter(function(index) {
      return $(this).prop('checked');
    }), function(i, inp) {
      console.log($.rels[inp['value']]);
      saved.push($.rels[inp['value']].join(" "));
    });
    var appl_div = $("div").filter(function(index) {return $(this).hasClass("applied");}).first();
    if (saved.length > 0) {
      appl_div.removeClass("hidden");
      var code_div = appl_div.find("div[class='code']");
      code_div.html(saved.join("<br/>"));
    }
  };

  $("#new-thing-dialog").tabs().dialog({
    autoOpen: false,
    modal: true,
    width: 500,
    buttons: {
      "Add a thing": function() {
        var active_tab = $("#new-thing-dialog").tabs("option", "active");
        switch (active_tab) {
          case 0:
            var id = $("#thing-id").val();
            var lbl = $("#thing-label").val();
            var ptype = $("#thing-provtype").val();
            var logo = $("#thing-logo").val();
            create_from_fields(id, lbl, ptype, "img/32/"+logo+".png");
            break;
          case 1:
            var url = $("#thing-url").val();
            create_from_url(url);
            break;
          case 2:
            break;
          default:
            break;
        }
        $(this).dialog("close");
      },
      Cancel: function() {
        $(this).dialog("close");
      }
    }
  });

  $(document).on("click", function(event) {
    var div = $(event.target).closest("div");
    if (div.hasClass("button")) {
      if (div.hasClass("work")) {
        if (div.attr("id")=="new") {
          console.log("add");
          // do not allow the same id to be added twice! 
          // keep list of ids then :)
          $("#new-thing-dialog").dialog("open");
        } else if (div.attr("id")=="annotate") {
          annotate();
        } else if (div.attr("id")=="save") {
          save_relations();
        }
      } else {
        console.log("toggle");
        div.toggleClass("selected");
      }
    }
  });

})

