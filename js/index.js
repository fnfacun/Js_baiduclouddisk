{
    let topPid = -1; // 最顶级 Pid
    let nowId = 0;  // 当前项 id
    // Object 找到当前自己
    function getSelf(id) {
        return data.filter(item => item.id == id)[0];
    };

    // Array 找到所有子级
    function getChild(pid) {
        return data.filter(item => item.pid == pid); // 
    }

    // Object 找到父级
    function getParent(id) {
        let self = getSelf(id);
        return getSelf(self.pid);
    };

    // Array 找到所有父级
    function getAllParent(id) {
        let parent = getParent(id);
        let allParent = [];
        while (parent) {
            allParent.unshift(parent);
            parent = getParent(parent.id);
        };
        return allParent;
    };

    // Array 找到所有子级
    function getAllChild(id) {
        let child = getChild(id);   // 找到所有子级
        let allChild = [];      // 声明数组
        if (child.length > 0) {     // 如果是有数据
            allChild = allChild.concat(child);
            child.forEach(item => {
                allChild = allChild.concat(getAllChild(item.id)); // 递归
            });
        };
        return allChild;
    }

    // Object 删除文件夹
    function removeData(id) {
        let remove = getAllChild(id); // 找到所有子级
        remove.push(getSelf(id));   // 存储当前 id 
        data = data.filter(item => !remove.includes(item)); // 循环每一项，如果当前是包含它所有子级的，不保留
    };

    // 移动到功能
    function moveData(id, newPid) {
        let self = getSelf(id);
        self.pid = newPid;
    };

    // 命名检测
    function testName(id, newName) {
        let child = getChild(id);
        return child.some(item => item.title == newName);
    };

    // 文件勾选
    function changeChecked(id, checked) {
        let self = getSelf(id);
        self.checked = checked;
    }

    // 全选
    function isCheckedAll() {
        let child = getChild(nowId);
        return child.every(item => item.checked) && child.length > 0;
    };

    // 全选
    let checkedAll = $('#checked-all');
    function setCheckedAll() {
        checkedAll.checked = isCheckedAll();
    };

    // 设置全选
    function setAllChecked(checked) {
        let child = getChild(nowId);
        child.forEach(item => {
            item.checked = checked;
        });
    };

    checkedAll.onchange = function () {
        setAllChecked(this.checked);
        folders.innerHTML = renderFolders();
    };

    // 获取 checkbox 选中的
    function getChecked() {
        let child = getChild(nowId);
        return child.filter(item => item.checked);
    };
    
    // 路径导航视图渲染
    let breadNav = $('.bread-nav');
    function renderBreadNav() {
        let self = getSelf(nowId);  // 获取当前项
        let allParent = getAllParent(nowId);    // 获取当前项的全部父级
        let inner = '';
        allParent.forEach(item => {
            inner += `<a data-id="${item.id}">${item.title}</a>`;
        });
        inner += `<span>${self.title}</span>`;
        setCheckedAll();
        return inner;
    };

    // 文件夹视图渲染
    let folders = $('#folders');
    function renderFolders() {
        let child = getChild(nowId);
        let inner = '';
        child.forEach(item => {
            inner += `<li data-id="${item.id}" class="folder-item ${item.checked ? "active" : ""}">
                        <img src="image/folder.png" alt="${item.title}">
                        <span class="folder-name">${item.title}</span>
                        <input type="text" class="editor" value="${item.title}">
                        <label class="checked">
                            <input type="checkbox" ${item.checked ? "checked" : ""} >
                            <span class="iconfont icon-checkbox-checked"></span>
                        </label>   
                    </li>`;
        });
        return inner;
    };

    // 树菜单渲染
    let treeMenu = $('#tree-menu');
    function renderTreeMenu(pid, level, isOpen) {
        let inner = '';
        let child = getChild(pid);
        let nowParent = getAllParent(nowId); // 找到当前项的所有父级
        nowParent.push(getSelf(nowId)); // 父级包括当前项
        inner += `<ul>
            ${child.map(item => {
            let itemChild = getChild(item.id);
            return ` <li class="${nowParent.includes(item) || isOpen ? "open" : ""}"> 
                        <p data-id="${item.id}" style="padding-left: ${40 + level * 20}px;" class="${itemChild.length ? "has-child" : ""}">
                            <span>${item.title}</span>
                        </p>
                        ${itemChild.length ? renderTreeMenu(item.id, level + 1, isOpen) : ""}
                     </li>`
        }).join("")}
        </ul>`;
        return inner;
    };

    // 渲染视图
    function render() {
        breadNav.innerHTML = renderBreadNav();
        folders.innerHTML = renderFolders();
        treeMenu.innerHTML = renderTreeMenu(-1, 0);
    };
    render();

    // 导航视图切换
    breadNav.addEventListener('click', (e) => {
        if (e.target.tagName == 'A') {
            nowId = e.target.dataset.id;
            data.forEach(item => {
                delete item.checked;
            });
        }
        render();
    });

    // 树菜单视图切换
    treeMenu.addEventListener('click', (e) => {
        let item = null;
        item = e.target.tagName == 'SPAN' ? item = e.target.parentNode : e.target;
        if (item.tagName == 'P') {
            nowId = item.dataset.id;
            data.forEach(item => {
                delete item.checked;
            });
            render();
        };
    });

    // 文件夹视图切换
    folders.addEventListener('click', (e) => {
            let item = null;
            if (e.target.tagName == 'LI') {
                item = e.target;
            } else if (e.target.tagName == 'IMG') {
                item = e.target.parentNode;
            };
            if (item) {
                data.forEach(item => {
                    delete item.checked;
                });
                nowId = item.dataset.id;
                render();
            };
    });

    // 双击重命名
    folders.addEventListener('dblclick', function (e) {
        if (e.target.className == 'folder-name') {
            reName(e.target.parentNode);
        };
    });

    // 文件夹勾选
    folders.addEventListener('change', (e) => {
        if (e.target.type == "checkbox") {
            let id = e.target.parentNode.parentNode.dataset.id;
            changeChecked(id, e.target.checked);
            folders.innerHTML = renderFolders();
            setCheckedAll();
        };
    });

    // 新建文件夹
    let createBtn = $('.create-btn');
    createBtn.onclick = () => {
        data.push({
            id: Date.now(),
            pid: nowId,
            title: getName()
        })
        setCheckedAll();
        alertSuccess("新建文件夹成功!");
        render();
    };

    // 新建文件夹命名排序
    function getName() {
        let child = getChild(nowId);
        let names = child.map(item => item.title);
        names = names.filter(item => {
            if (item === '新建文件夹') {
                return true;
            };
            if (
                item.substring(0, 6) === '新建文件夹('
                && Number(item.substring(6, item.length - 1)) >= 2
                && item[item.length - 1] == ')'
            ) {
                return true;
            };
            return false;
        });
        names.sort((n1, n2) => {
            n1 = n1.substring(6, n1.length - 1);
            n2 = n2.substring(6, n2.length - 1);
            n1 = isNaN(n1) ? 0 : n1;
            n2 = isNaN(n2) ? 0 : n2;
            return n1 - n2;
        });
        if (names[0] !== '新建文件夹') {
            return `新建文件夹`;
        };
        for (let i = 1; i < names.length; i++) {
            if (Number(names[i].substring(6, names[i].length - 1)) !== i + 1) {
                return `新建文件夹(${i + 1})`
            };
        };
        return `新建文件夹(${names.length + 1})`;
    };

    // 成功弹窗
    function alertSuccess(info) {
        let success = $('.alert-success');
        clearTimeout(success.timer);
        success.innerHTML = info;
        success.classList.add('alert-show');
        success.timer = setTimeout(() => {
            success.classList.remove('alert-show');
        }, 800);
    };

    // 失败弹窗
    function alertWarning(info) {
        let warning = $('.alert-warning');
        clearTimeout(warning.timer);
        warning.innerHTML = info;
        warning.classList.add('alert-show');
        warning.timer = setTimeout(() => {
            warning.classList.remove('alert-show');
        }, 800);
    };

    // 鼠标右键显示菜单
    let contextmenu = $('#contextmenu');
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
    });

    window.addEventListener('mousedown', (e) => {
        css(contextmenu, 'display', 'none');
    });

    window.addEventListener('resize', (e) => {
        css(contextmenu, 'display', 'none');
    });

    window.addEventListener('scroll', (e) => {
        css(contextmenu, 'display', 'none');
    });

    folders.addEventListener('contextmenu', (e) => {
        let folder = null;
        if (e.target.tagName == "LI") {
            folder = e.target;
        } else if (e.target.parentNode.tagName == 'LI') {
            folder = e.target.parentNode;
        };
        if (folder) {
            contextmenu.style.display = 'block';
            let l = e.clientX;
            let t = e.clientY;
            let maxL = document.documentElement.clientWidth - contextmenu.offsetWidth;
            let maxT = document.documentElement.clientHeight - contextmenu.offsetHeight;
            l = Math.min(l, maxL);
            t = Math.min(t, maxT);
            css(contextmenu, {
                top: t,
                left: l
            })
            e.preventDefault();
            e.stopPropagation();
        };
        contextmenu.folder = folder;
    });

    // 移动到 - 弹窗
    let moveAlertEl = document.querySelector('.move-alert');
    let closMoveAlert = moveAlertEl.querySelector('.clos');
    let confirmBtns = moveAlertEl.querySelectorAll('.confirm-btns a');
    let moveAlertTreeMenu = moveAlertEl.querySelector('.tree-menu');
    let newPid = null;
    function moveAlert(deterMine, canCel) {
        moveAlertTreeMenu.innerHTML = renderTreeMenu(topPid, 0, true);
        moveAlertEl.classList.add('move-alert-show');
        css(mask, 'display', 'block');
        newPid = null;
        confirmBtns[0].onclick = () => {
            moveAlertEl.classList.remove('move-alert-show');
            css(mask, 'display', 'none');
            deterMine && deterMine();
        };
        confirmBtns[1].onclick = () => {
            moveAlertEl.classList.remove('move-alert-show');
            css(mask, 'display', 'none');
            canCel && canCel();
        };
    };

    // 右键菜单点击
    contextmenu.addEventListener('mousedown', (e) => {
        e.stopPropagation();
    });

    // 右键菜单各个功能点击内容
    contextmenu.addEventListener('click', function (e) {
        e.stopPropagation();
        css(contextmenu, 'display', 'none');
        if (e.target.classList.contains('icon-lajitong')) {
            confirmAlert("确定删除文件夹吗?", () => {
                alertSuccess("删除文件夹成功");
                let checkedData = getChecked();
                checkedData.forEach(item => {
                    removeData(item.id);
                });
                removeData(Number(this.folder.dataset.id));
                render();
            });
        } else if (e.target.classList.contains('icon-yidong')) {
            let id = Number(this.folder.dataset.id);
            let nowPid = getSelf(id).pid;
            moveAlert(() => {
                if (newPid === null || nowPid == newPid) {
                    alertWarning("你没有移动位置");
                    return false;
                };
                let allChild = getAllChild(id);  // 获取所有子级
                let parent = getSelf(newPid);   // 从当前项获取它的父级
                allChild.push(getSelf(id));
                if (allChild.includes(parent)) {
                    alertWarning("不能把文件夹移动到自己里");
                    return false;
                };
                if (testName(newPid, getSelf(id).title)) {
                    alertWarning("文件夹里命名冲突");
                    return false;
                };
                // 勾选批量
                let checkedData = getChecked();
                if(checkedData){
                    for (let i = 0; i < checkedData.length; i++) {
                        let id = checkedData[i].id;
                        let allChild = getAllChild(id);
                        let parent = getSelf(newPid);
                        allChild.push(checkedData[i]);
                        if (allChild.includes(parent)) {
                            alertWarning("不能把文件夹移动到自己里");
                            return;
                        };
                        if (testName(newPid, checkedData[i].title)) {
                            alertWarning("文件夹里命名冲突");
                            return;
                        };
                    };
                    checkedData.forEach(item => {
                        moveData(item.id,newPid);
                    });
                    data.forEach(item=>{
                        delete item.checked;
                    });
                };
                moveData(id, newPid);
                alertSuccess("文件夹移动成功");
                nowId = newPid;
                render();
                return true;
            })
        } else if (e.target.classList.contains('icon-zhongmingming')) {
            reName(this.folder);
        };
    });

    // 移动到 - 弹窗数据点击
    moveAlertTreeMenu.addEventListener('click', (e) => {
        let item = e.target.tagName == "SPAN" ? e.target.parentNode : e.target;
        if (item.tagName == "P") {
            let p = moveAlertEl.querySelectorAll('p');
            p.forEach(item => {
                item.classList.remove('active');
            });
            item.classList.add('active');
            newPid = item.dataset.id;
        };
    });

    // 移动到右上角 X 号
    closMoveAlert.onclick = () => {
        moveAlertEl.classList.remove('move-alert-show');
        css(mask, 'display', 'none');
    };

    // 删除 - 弹窗组件
    function confirmAlert(info, deterMine, canCel) {
        let confirm = $('.confirm');
        let alertClos = confirm.querySelector('.clos');
        let confirmBtns = confirm.querySelectorAll('.confirm-btns a');
        css(mask, 'display', 'block');
        confirm.classList.add('confirm-show');
        confirmBtns[0].onclick = () => {
            css(mask, 'display', 'none');
            confirm.classList.remove('confirm-show');
            deterMine && deterMine();
        };
        confirmBtns[1].onclick = () => {
            css(mask, 'display', 'none');
            confirm.classList.remove('confirm-show');
            canCel && canCel();
        };
        alertClos.onclick = function () {
            css(mask, 'display', 'none');
            confirm.classList.remove('confirm-show');
        };
    };

    function reName(folder) {
        let folderName = folder.querySelector('.folder-name');
        let editor = folder.querySelector('.editor');
        css(folderName, 'display', 'none');
        css(editor, 'display', 'block');
        editor.select();
        editor.onblur = () => {
            if (editor.value == folderName.innerHTML) {
                css(folderName, 'display', 'block');
                css(editor, 'display', 'none');
                return;
            };
            if (testName(nowId, editor.value)) {
                alertWarning("文件夹里有命名重复");
                editor.focus();
                return;
            };
            if (!editor.value.trim()) {
                alertWarning("请输入文件夹名字");
                editor.focus();
                return;
            };
            getSelf(folder.dataset.id).title = editor.value;
            alertSuccess("文件夹重命名成功");
            render();
        };
    };

    document.addEventListener('selectstart', (e) => {
        e.preventDefault()
    });

    // 框选
    let selectBox = null;
    folders.addEventListener('mousedown', (e) => {
        let foldersItem = folders.querySelectorAll('.folder-item');
        if (e.button !== 0) {
            return;
        }
        let current = {
            x: e.clientX,
            y: e.clientY
        };
        function move(e) {
            if (!selectBox) {
                selectBox = document.createElement('div');
                selectBox.id = "select-box";
                document.body.appendChild(selectBox);
            };
            let nowStart = {
                x: e.clientX,
                y: e.clientY
            };
            let dis = {
                x: nowStart.x - current.x,
                y: nowStart.y - current.y
            };
            css(selectBox, {
                left: Math.min(current.x, nowStart.x),
                top: Math.min(current.y, nowStart.y),
                width: Math.abs(dis.x),
                height: Math.abs(dis.y)
            });
            foldersItem.forEach(item => {
                let checkbox = item.querySelector('[type="checkbox"]');
                if (SquareCollision(item, selectBox)) {
                    item.classList.add('active');
                    checkbox.checked = true;
                } else {
                    item.classList.remove('active');
                    checkbox.checked = false;
                };
                changeChecked(item.dataset.id, checkbox.checked);
            });
            setCheckedAll();
        };
        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', move);
            if (selectBox) {
                document.body.removeChild(selectBox);
                selectBox = null;
            };
        }, {
            once: true
        });
    });

    // 批量删除
    let delBtn = $('.del-btn');
    delBtn.addEventListener('click', (e) => {
        let checkedData = getChecked();
        confirmAlert("确定删除文件夹吗?", () => {
            checkedData.forEach(item => {
                removeData(item.id);
            });
            render();
            alertSuccess("删除文件夹成功");
        });
    });

    // 批量移动
    let moveBtn = $('.move-btn');
    moveBtn.addEventListener('click', (e) => {
        let checkedData = getChecked();
        if (checkedData.length == 0) {
            alertWarning("请选择你要操作的文件夹");
            return;
        };
        let nowPid = getSelf(nowId).pid;
        moveAlert(() => {
            if (newPid === null || nowPid == newPid) {
                alertWarning("你没有移动位置");
                return false;
            };
            for (let i = 0; i < checkedData.length; i++) {
                let id = checkedData[i].id;
                let allChild = getAllChild(id);
                let parent = getSelf(newPid);
                allChild.push(checkedData[i]);
                if (allChild.includes(parent)) {
                    alertWarning("不能把文件夹移动到自己里");
                    return false;
                };
                if (testName(newPid, checkedData[i].title)) {
                    alertWarning("文件夹里命名冲突");
                    return false;
                };
            };
            moveData(id, newPid);
            nowId = newPid;
            data.forEach(item => {
                delete item.checked;
            });
            alertSuccess("文件夹移动成功");
            render();
            return true;
        })
    });
}