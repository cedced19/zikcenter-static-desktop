$(function() {
    var fs = require('./node_modules/fs-extra'),
        path = require('path'),
        dir = path.dirname(process.execPath) + '/generated';

    $.material.init();
    fs.mkdirp(dir + '/musics');
    fs.copy('./template/', dir, {encoding: 'utf8'});

     document.getElementById('#button').onclick = function() {
            var departure = $('#directory').val();
            if (departure != '') {
                departure = path.normalize(departure);
                fs.emptyDir(dir + '/musics', function () {
                    fs.copy(departure, dir + '/musics', {encoding: 'utf8'}, function() {
                        fs.writeFile(dir + '/data.json', JSON.minify(JSON.stringify(ls(dir)), null, 4), function (err) {
                            $('.modal').modal('show');
                        });
                    });
                });
            }
     };
});
