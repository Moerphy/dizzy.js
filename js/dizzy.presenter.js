dizz = new Dizzy('#dizzy');
var inputNumberMode = false;

// Read a page's GET URL variables and return them as an associative array.
// found at <http://snipplr.com/view/799/get-url-variables/>, modified
function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('#')[0].split('&');

    for(var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }

    return vars;
}

$(document).ready( 

    function(){
        var get = getUrlVars();
        var filepath = get['file'];
        dizz.load(filepath);

        $(document).keydown(function(e) {

            if (e.which == 32 || e.which == 39) {
                /* space bar or right button */
                location.hash = '#' + (dizz.getShownGroupNumber() + 1);

            } else if (e.which == 37) {
                location.hash = '#' + (dizz.getShownGroupNumber() - 1);

            } else if (e.which >= 48 && e.which <= 57 ) {
                var newHash = '#';

                if( inputNumberMode ) {
                    newHash = location.hash;
                }

                location.hash = newHash + ( e.which-48 );
                inputNumberMode = true;

                setTimeout(function() {
                    inputNumberMode = false;
                    },
                    500
                );

            } else if (e.which == 27) {
                dizz.toggleOverview();
            }

        });

    }

);

var lastHash = '';
setInterval(function() { 

    if( !inputNumberMode && location.hash != lastHash ) {
        lastHash = location.hash;
        var groupNum = 0;

        if(lastHash.length >= 1) {
            groupNum = lastHash.substr(1);
        }

        dizz.show(groupNum);
        }
    },
    200
);
