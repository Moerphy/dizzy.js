dizz = new Dizzy('#dizzy');
var inputNumberMode = false;

$(document).ready( 

    function(){
        var filepath = window.location.hash.substr(1);
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
