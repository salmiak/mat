function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

export const apiUri = "//localhost:8888/mat/wp-json/wp/v2"
export const authToken = b64EncodeUnicode( 'alfred:ILAt VfPY E86i kMjw Zyzg wQSx' )
export const wpProcess = function(post) {
  post.title = post.title.rendered
  if(post.content) post.content = post.content.rendered
  post.fields = JSON.parse(JSON.stringify(post.acf))
  delete post.acf
  return post
}