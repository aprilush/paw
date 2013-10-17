function add_new() {
  console.log("add");
  create_new_button("ent1", "Johnny Bravo", "entity", "Charm.png");
};

function create_new_button(id, label, provtype, img) {
  var div = $("<div class='button'></div>");
  div.html("<input type='image' id='entity2' title='entity2' provtype='entity' src='img/32/Charm.png' />");
  $("div[class='layer'] > div[class='banner']").filter(function(index) { 
    return ((provtype=="entity" && $(this).text()=="WHAT") || (provtype=="agent" && $(this).text()=="WHO") || (provtype=="activity" && $(this).text()=="HOW"))  
  }).map(function(index) {
    $(this).parent().append(div);
  });
}


function copy_button(id) {
  return $('input').filter(function(index) {
    if ($(this).attr("id")==id) {
      return $(this);
    }
  }).first().closest("div").clone().removeClass("selected");
}

function annotate() {
  console.log("anno");
  if ($.things) {
    console.log("things exists, truncating");
    $.things.length = 0;
  } else {
    $.things = [];
  }
  if ($.activities) {
    console.log("activities exists, truncating");
    $.activities.length = 0;
  } else {
    $.activities = [];
  }
  if ($.agents) {
    console.log("agents exists, truncating");
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
      poss_div.append(div1.css("clear", "left"));
      poss_div.append("<div class='relation'>"+stat[1]+"</div>");
      poss_div.append(div2);
      poss_div.append("<div class='relation'><input type='checkbox' value='"+i+"'>Keep!</input></div>");
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
}

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
}

$(document).on("click", function(event) {
  var div = $(event.target).closest("div");
  if (div.hasClass("button")) {
    if (div.hasClass("work")) {
      if (div.attr("id")=="new") {
        add_new();
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
