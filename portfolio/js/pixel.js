$(function() {
    var a = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,2,0,0,0,2,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,0,0,2,0,0],
        [0,0,0,1,1,0,0,0],
        [0,2,0,0,0,2,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var c = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,1,1,1,2,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,0,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var e = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,1,1,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,1,1,1,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var i = [
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
        [0,1,2,0,1,0],
        [0,0,0,0,0,0],
        [0,0,2,0,0,0],
        [0,0,0,0,0,0],
        [0,0,2,0,0,0],
        [0,0,2,0,0,0],
        [0,1,0,0,1,0],
        [0,0,0,0,0,0],
        [0,0,0,0,0,0],
    ];
    var l = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,1,1,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var o = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,2,0,0,0,2,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,0,0,2,0,0],
        [0,2,0,0,0,2,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,1,1,1,1,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var p = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,1,1,1,0,0],
        [0,0,0,0,0,2,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,1,1,1,0,0],
        [0,2,0,0,0,0,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var m = [
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,2,0,0,0,0,0,0,1,0],
        [0,0,2,0,0,0,0,2,0,0],
        [0,1,0,2,0,0,1,0,0,0],
        [0,1,0,0,0,1,0,2,0,0],
        [0,1,0,0,1,0,0,0,0,0],
        [0,1,0,0,0,0,0,2,0,0],
        [0,1,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0],
    ];
    var n = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,0,0,0,1,0],
        [0,0,2,0,0,0,1,0],
        [0,1,0,2,0,0,1,0],
        [0,1,0,0,0,2,0,0],
        [0,1,0,0,1,0,0,0],
        [0,1,0,0,0,1,1,0],
        [0,1,0,0,0,0,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var r = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,2,0,1,1,1,0,0],
        [0,0,0,0,0,2,0,0],
        [0,2,0,0,0,0,0,0],
        [0,0,0,1,1,1,0,0],
        [0,2,0,0,0,2,0,0],
        [0,2,0,0,0,2,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var t = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,2,0,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,2,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,2,0,0,0,0],
        [0,0,0,2,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var x = [
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,1,0],
        [0,1,1,0,0,0,1,0],
        [0,0,1,1,0,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,1,0,1,1,0,0],
        [0,1,0,0,0,1,1,0],
        [0,1,0,0,0,1,1,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var y =[
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,1,0],
        [0,1,1,0,0,0,1,0],
        [0,0,1,1,0,1,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,1,1,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];
    var dot =[
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,1,1,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
        [0,0,0,0,0,0,0,0],
    ];

    var spans   = ['#span-create','#span-control','#span-compete'];
    var words   = [[c,r,e,a,t,e,dot],[c,o,n,t,r,o,l,dot],[c,o,m,p,e,t,e,dot]];
    var gap     = 0;
    var size    = 6;
    var size2   = size + 3;
    var s       = 0;
    var square  = '';
    var x       = 0;
    var y       = 0;
    var svgWidth  = 6 * size + (5 * gap) + gap;
    var svgHeight = 7 * size + (6 * gap) + gap;

    // generate shadow pixels first b/c of how svg rects stack
    for (var w = 0; w < words.length; w++) { 
        // if (w == 0) continue;
        for (var i = 0; i < words[w].length; i++) {
            var svgWidth    = words[w][i][0].length * size + ((words[w][i][0].length - 1)   * gap) + gap;
            var svgHeight   = words[w][i].length    * size + ((words[w][i].length - 1)      * gap) + gap;
            var elementSvg  = '<svg class="svg-letter" id="letter-' + (w + '' + i) + '" data-index="' + (w + '' + i)
                                + '" width="' + svgWidth + '" height="' + svgHeight + '" style="margin:5px;">'
            $(spans[w]).append(elementSvg);
            for (var j = 0; j < words[w][i].length; j++) {
                for (var k = 0; k < words[w][i][j].length; k++) {
                    if (words[w][i][j][k] == 0) {
                        continue;
                    }
                    if (words[w][i][j][k] == 2) {
                        s = size * 2 + 3;
                    } else {
                        s = size + 3;
                    }
                    x = k * (size + gap) + (gap / 2);
                    y = j * (size + gap) + (gap / 2);
                    x += 3;
                    y += 3;
                    square = '<rect data-size="' + s + '" data-x="' + x + '" data-y="' + y + '"class="pixels shadow shadow-' + (w + '' + i) 
                            + '" x="' + x + '" y="' + (-100)
                            + '" width="' + s + '" height="' + s + '" />';
                    $('#letter-' + (w + '' + i)).append(square);                            
                }
            }
        }
    }

    // generate white pixels
    for (var w = 0; w < words.length; w++) { 
        // if (w == 0) continue;
        for (var i = 0; i < words[w].length; i++) {
            var svgWidth    = words[w][i][0].length * size + ((words[w][i][0].length - 1)   * gap) + gap;
            var svgHeight   = words[w][i].length    * size + ((words[w][i].length - 1)      * gap) + gap;
            for (var j = 0; j < words[w][i].length; j++) {
                for (var k = 0; k < words[w][i][j].length; k++) {
                    if (words[w][i][j][k] == 0) {
                        continue;
                    }
                    if (words[w][i][j][k] == 2) {
                        s = size * 2;
                    } else {
                        s = size;
                    }
                    x = k * (size + gap) + (gap / 2);
                    y = j * (size + gap) + (gap / 2);
                    square = '<rect data-size="' + s + '" data-x="' + x + '" data-y="' + y + '"class="pixels pixel pixel-' + (w + '' + i) 
                            + '" x="' + x + '" y="' + (-100)
                            + '" width="' + s + '" height="' + s + '" />';
                    $('#letter-' + (w + '' + i)).append(square);
                }
            }
        }
    }

    // have to refresh the div when placing svg with jquery
    $("#main-info").html($("#main-info").html());

    // var size = 12;
    // var size2 = size + 10;

    function explode(element, elementSize, svgWidth, svgHeight, color) {
        // element.clearQueue();
        var x = Math.floor(Math.random() * (svgWidth - elementSize)) + 1;
        var y = Math.floor(Math.random() * (svgHeight - elementSize)) + 1;
        var rand = Math.floor(Math.random() * 3) + 2;
        element.animate({
            svgX: x,
            svgY: y,
            svgWidth: elementSize / rand,
            svgHeight: elementSize / rand
        }, {duration: 200});
        element.css('fill', color).css('stroke', color);
    }

    function implode(element, elementSize, color) {
        elementSize = element.data('size');
        // element.clearQueue();
        element.animate({
            svgX: element.data('x'),
            svgY: element.data('y'),
            svgWidth: elementSize,
            svgHeight: elementSize
        }, {duration: 100});
        element.css('fill', color).css('stroke', color);
    }

    var colors = ['#B3C4EE', '#B3E5E1', '#F4E3F7', '#FBF5B5', '#E3F5C0', '#F4DFD6', 'black', 'white'];

    $('.svg-letter').mouseenter(function() {
        var index = this.id.replace('letter-', '');
        var w = $(this).attr('width');
        var h = $(this).attr('height');
        var color1 = colors[Math.floor(Math.random() * colors.length)];
        var color2 = colors[Math.floor(Math.random() * colors.length)];
        $('.pixel-' + index).each(function(i, obj) {
            // $(this).css('fill', 'yellow').css('stroke', 'yellow');
            explode($(this), size, w, h);
        }).css('fill', color1).css('stroke', color1);
        $('.shadow-' + index).each(function(i, obj) {
            // $(this).css('fill', 'purple').css('stroke', 'purple');
            explode($(this), size2, w, h);
        }).css('fill', color2).css('stroke', color2);
    });

    $('.svg-letter').mouseleave(function() {
        var index = this.id.replace('letter-', '');
        $('.pixel-' + index).each(function(i, obj) {
            $(this).css('fill', 'white').css('stroke', 'white');
            implode($(this), size);
        });
        $('.shadow-' + index).each(function(i, obj) {
            $(this).css('fill', 'black').css('stroke', 'black');
            implode($(this), size2);
        });
    });

    var times = [500,1000,1500];

    function blockIntro() {
        $('#span-create .pixels').each(function(i, obj) {
            var duration = times[Math.floor(Math.random() * times.length)];
            var rect = $(this);
            setTimeout(function() {
                rect.animate({
                    svgX: rect.data('x'),
                    svgY: rect.data('y'),
                }, {duration: duration})
            }, .01 * i);
        });
        $('#span-control .pixels').each(function(i, obj) {
            var duration = times[Math.floor(Math.random() * times.length)];
            var rect = $(this);
            setTimeout(function() {
                rect.animate({
                    svgX: rect.data('x'),
                    svgY: rect.data('y'),
                }, {duration: duration})
            }, .01 * i);
        });
        $('#span-compete .pixels').each(function(i, obj) {
            var duration = times[Math.floor(Math.random() * times.length)];
            var rect = $(this);
            setTimeout(function() {
                rect.animate({
                    svgX: rect.data('x'),
                    svgY: rect.data('y'),
                }, {duration: duration})
            }, .01 * i);
        });
    }

    blockIntro();
    
});