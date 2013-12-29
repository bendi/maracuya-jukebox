define(['console'], function(console) {

    function uploadFiles(url, files, listener) {
        console.log("got files: ", files);

        if (!files.length) {
            return;
        }

        var uploadFn = getUploadFn(url, files[0], listener);

        for (var i = 1, file; i < files.length; ++i) {
            file = files[i];
            uploadFn = getUploadFn(url, file, listener, uploadFn);
        }

        uploadFn();
    }

    function getUploadFn(url, file, listener, next) {
        return function() {
            var formData = new FormData();
            console.log("Starting file upload: ", file.name);
            listener.start(file);
            formData.append(file.name, file);
            upload(url, file.name, formData, listener, next);
        };
    }

    function upload(url, fileName, formData, listener, next) {
        var xhr = new XMLHttpRequest();

        xhr.upload.addEventListener('load', function(e) {
            listener.end(fileName, next !== undefined);
            if (next) {
                console.log("Upload finished calling next");
                setTimeout(next, 1);
            } else {
                console.log("Upload finished");
            }
        });

        xhr.upload.addEventListener('progress', function (event) {
            if (event.lengthComputable) {
                listener.progress(fileName, event.loaded, event.total);
            }
        });

        xhr.open('POST', url, true);

        xhr.send(formData);
    }

    return function(homeUrl, mediaLibrarySelector, listener) {
        //$('#jukebox .mediaLibrary')
        $(mediaLibrarySelector)
            .on('dragover', function () {
                $(this).addClass('hover');
                return false;
            })
            .on('dragend', function () {
                $(this).removeClass('hover');
                return false;
            })
            .on('drop', function (e) {
                e.preventDefault();

                $(this).removeClass('hover');

                // now do something with:
                var dataTransfer = e.originalEvent && e.originalEvent.dataTransfer || e.dataTransfer;
                var files = dataTransfer.files;

                listener.init(files);

                uploadFiles(homeUrl + '/upload', files, listener);

                return false;
            });
    };
});