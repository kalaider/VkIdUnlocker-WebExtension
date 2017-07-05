function isNullOrEmpty(v) {
    return typeof v === 'undefined' || v === null || !v;
}

function createBlock(realUrl) {
    var newBlock = window.document.createElement('div');
    newBlock.id = 'viu_block';
    newBlock.className = 'page_block';
    
    newBlock.innerHTML =
    '<div id="viu_info_wrap" class="page_info_wrap">' +
        '<div style="text-align: center"><b>VkIdUnlocker</b></div>' +
        '<p></p><div style="text-align: center"><b>' + realUrl + '</b></div>' +
    '</div>';
    
    return newBlock;
}

function addVIUInfo(realUrl) {
    var block = window.document.querySelector('.wide_column > #viu_block');
    if (!isNullOrEmpty(block)) {
        block.remove();
    }
    var firstBlock = window.document.querySelector('.wide_column > .page_block');
    var newBlock = createBlock(realUrl);
    firstBlock.parentNode.insertBefore(newBlock, firstBlock);
}



function run() {
    var url = window.location.href;
    var match = url.match(/^http(?:s)?\:\/\/[\w\.\-\_]*vk\.com\/([^\s\/\?\#]+)\/?(?:\#.*)?$/);
    var username = '';
    if (!isNullOrEmpty(match)) {
        username = match[1];
        var editButton = window.document.querySelector('a[href="edit"]');
        if (!isNullOrEmpty(editButton)) {
            return;
        }
        var regex = /\/wall(\d+)/g;
        match = regex.exec(window.document.body.innerHTML);
        var userId = '';
        if (!isNullOrEmpty(match)) {
            userId = match[1];
        }
        if (userId === '' || (username === ('id' + userId))) {
            var req = new XMLHttpRequest({mozSystem: true});
            req.withCredentials = true;
            req.open("GET", 'https://api.vk.com/method/users.get?user_ids=' + (userId === '' ? username : userId) + '&v=5.52&fields=domain', true);
            req.setRequestHeader("Pragma", "no-cache");
            req.setRequestHeader("Cache-Control", "no-cache");
            req.onload = () => {
                if (req.status == 200) {
                    var json = JSON.parse(req.responseText);
                    if (typeof json.error === 'undefined') {
                        var vkusername = json.response[0].domain;
                        userId = json.response[0].id;
                        if (vkusername !== 'id' + userId) {
                            addVIUInfo('<a href="https://vk.com/id' + userId + '">' + userId + '</a> &lt;---&gt; <a href="https://vk.com/' + vkusername + '">' + vkusername + '</a>');
                            return;
                        }
                    }
                }
                if (userId !== '') {
                    addVIUInfo('<a href="https://vk.com/id' + userId + '">' + userId + '</a>');
                }
            };
            req.onerror = () => {
                if (userId !== '') {
                    addVIUInfo('<a href="https://vk.com/id' + userId + '">' + userId + '</a>');
                }
            };
            req.send(null);
        } else {
            if (userId !== '') {
                addVIUInfo('<a href="https://vk.com/id' + userId + '">' + userId + '</a> &lt;---&gt; <a href="https://vk.com/' + username + '">' + username + '</a>');
            }
        }
    }
};

//run();

if (typeof browser !== 'undefined') {
    browser.runtime.onMessage.addListener(
        function (request, sender) {
            run();
        }
    );
    
    browser.runtime.sendMessage({});
} else if (typeof chrome !== 'undefined') {
    chrome.extension.onMessage.addListener(
        function (request, sender) {
            run();
        }
    );
    
    chrome.extension.sendMessage({});
}