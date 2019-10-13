if (!document.getElementById("EmbedSocialIFrame")) {
    var jsEmbed = document.createElement("script");
    jsEmbed.id = "EmbedSocialIFrame", jsEmbed.src = "js/social.js", document.getElementsByTagName("body")[0].appendChild(jsEmbed)
}
 if(!document.getElementById("EmbedSocialJsLightbox")) {
    var jsEmbed = document.createElement("script");
    jsEmbed.id = "EmbedSocialJsLightbox";
    jsEmbed.src = "js/lightbox.js";
    document.getElementsByTagName("body")[0].appendChild(jsEmbed);
}
if (!document.getElementById("EmbedSocialLightboxCSS")) {
    var cssEmbed = document.createElement("link");
    cssEmbed.id = "EmbedSocialLightboxCSS", cssEmbed.rel = "stylesheet", cssEmbed.href = "css/lightboxStyle.css";
    document.getElementsByTagName("head")[0].appendChild(cssEmbed);
}
EMBEDSOCIALINSTAGRAM = {
    getEmbedData: function(albumRef, albumDiv) {
      var ifrm = document.createElement("iframe");
    	var srcIfrm = "https://embedsocial.com/api/pro_album/instagram/"+albumRef;
        ifrm.setAttribute("src", srcIfrm);
        ifrm.setAttribute("id", 'embedIFrame_'+albumRef+Math.random().toString(36).substring(7));

        ifrm.style.width = "0px";
        ifrm.style.height = "0px";
        ifrm.style.maxHeight = "100%";
        ifrm.style.maxWidth = "100%";
        ifrm.style.minHeight = "100%";
        ifrm.style.minWidth = "100%";
        ifrm.style.border = "0";
        ifrm.setAttribute("class", "embedsocial-in-album-iframe");

        ifrm.setAttribute("scrolling","no");
        albumDiv.appendChild(ifrm);
        EMBEDSOCIALINSTAGRAM.initResizeFrame();
    },
    initResizeFrame: function() {
        if(document.getElementById("EmbedSocialIFrame") && "function" === typeof iFrameResize) {
            iFrameResize ({
                messageCallback : function(messageData){
                    EMBEDSOCIALINSTAGRAM.createLightBox(messageData.message);
                }
            }, '.embedsocial-in-album-iframe');
        } else {
            setTimeout(EMBEDSOCIALINSTAGRAM.initResizeFrame, 200);
        }
    },
    createLightBox : function(data){
        if (document.getElementById('embedSocialLightboxDiv') && document.getElementById('embedSocialLightboxDiv').getAttribute('data-ref') == data.albumRef && document.getElementById('embedSocialLightboxDiv').getAttribute('data-num') == data.albumNum && document.getElementById('embedSocialLightboxDiv').getAttribute('data-captions') == data.showCaptions) {
            for(var i = 0; i < data.albumImages.length; i++) {
                if (data.albumImages[i].click == true) {
                    EMBEDSOCIALINSTAGRAM.openLightBox(data.albumImages[i].id);
                }
            }
        } else {
            if (!document.getElementById('embedSocialLightboxDiv')) {
                var divImages = document.createElement("div");
                divImages.setAttribute("data-ref", data.albumRef);
                divImages.setAttribute("data-num", data.albumNum);
                divImages.setAttribute("data-captions", data.showCaptions);
                divImages.setAttribute("class", 'embedSocialLightboxDiv');
                divImages.setAttribute("id", 'embedSocialLightboxDiv');
                divImages.style.display = "none";
                document.body.appendChild(divImages);
            } else {
                divImages = document.getElementById('embedSocialLightboxDiv');
                divImages.setAttribute("data-ref", data.albumRef);
                divImages.setAttribute("data-num", data.albumNum);
                divImages.setAttribute("data-captions", data.showCaptions);
                divImages.innerHTML = '';
            }
            for(var i = 0; i < data.albumImages.length; i++) {
                var divHref = document.createElement("a");
                divHref.setAttribute("href", data.albumImages[i].href);
                divHref.setAttribute("id", "embed-lightbox-"+data.albumImages[i].id);
                var divImg = document.createElement("img");
                divImg.setAttribute("src", data.albumImages[i].href);
                if (data.showCaptions == true) {
                	divImg.setAttribute("alt", data.albumImages[i].caption);
                }
                divHref.appendChild(divImg);
                divImages.appendChild(divHref);
            }

            if (data.showCaptions == true) {
                embedLightBox.run('.embedSocialLightboxDiv', {
                    captions: function(element) {
                       return element.getElementsByTagName('img')[0].alt;
                   },
                   filterlightem: new RegExp('((.+\.(gif|jpe?g|png|webp))|size=l$)', 'i')
                });
            } else {
                embedLightBox.run('.embedSocialLightboxDiv', {
                    filterlightem: new RegExp('((.+\.(gif|jpe?g|png|webp))|size=l$)', 'i')
                });
            }
            for(var i = 0; i < data.albumImages.length; i++) {
                if (data.albumImages[i].click == true) {
                    EMBEDSOCIALINSTAGRAM.openLightBox(data.albumImages[i].id);
                }
            }
        }
    },
    openLightBox : function(imageId) {
        document.getElementById("embed-lightbox-"+imageId).click();
    }
}

var embedsocialInstagramAlbums = document.getElementsByClassName("embedsocial-instagram");
var embedsocialInstagramAlbumsRef = [];
for (i = 0; i < embedsocialInstagramAlbums.length; i++) {
    var embedsocialInstagramAlbumRef = embedsocialInstagramAlbums[i].getAttribute("data-ref");
    if (!(embedsocialInstagramAlbumsRef.indexOf(embedsocialInstagramAlbumRef) > -1)) {
        embedsocialInstagramAlbumsRef.push(embedsocialInstagramAlbumRef);
        EMBEDSOCIALINSTAGRAM.getEmbedData(embedsocialInstagramAlbumRef , embedsocialInstagramAlbums[i]);
    }
}
