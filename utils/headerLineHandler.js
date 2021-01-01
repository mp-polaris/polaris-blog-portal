export default function (opts) {
  let defaultOpts = {
    linkClass: 'cl-link',                             // 所有目录项都有的类
    linkActiveClass: 'cl-link-active',                // active的目录项
    datasetName: 'data-cata-target',                  // 目录项DOM的attribute存放对应目录的id
    selector: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],   // 按优先级排序
    scrollWrapper: null,                              // 按优先级排序
    activeHook: null,                                 // 激活时候回调
    topMargin: 0,
    bottomMargin: 0,
    cool: false                                        // 炫酷模式开关
  };

  const Opt = Object.assign({}, defaultOpts, opts);

  const $content = document.getElementById(Opt.contentEl);                          // 内容获取区
  const $catalog = document.getElementById(Opt.catalogEl);                          // 目录容器
  const $contentCategoryBox = document.getElementById('article-content-category-box');
  if ($contentCategoryBox) {
    $contentCategoryBox.innerHTML = '';
  }
  let allCatalogs = $content.querySelectorAll(Opt.selector.join());
  let tree = getCatalogsTree(allCatalogs);
  //handleCategoryLiId($categoryLis, tree);

  try {
    //console.log(allCatalogs.length);
    if (allCatalogs.length === 0) {
      $catalog.parentElement.style.display = 'none';
      $catalog.style.display = 'none';
      return;
    }
    $catalog.parentElement.style.display = 'block';
    $catalog.style.display = 'block';
    $catalog.innerHTML = `<div class='cl-wrapper'>${generateHtmlTree(tree, {id: -1})}</div>`;
    if ($contentCategoryBox) {
      $contentCategoryBox.innerHTML = `<div class='content-category-title'>文章目录</div><div class='cl-wrapper'>${generateHtmlTree(tree, {id: -1})}</div>`;
    }
  } catch (e) {
    console.error('error', e)
  }


  // 事件注册
  // window.addEventListener('resize', drawPath);
  $catalog.addEventListener('click', clickHandler);
  if ($contentCategoryBox) {
    $contentCategoryBox.addEventListener('click', clickHandler);
  }
  //Opt.cool && $scroll_wrap.addEventListener('scroll', coolScrollHandler);
  window.addEventListener('scroll', simpleScrollHandler);


  /**
   * 普通模式下滚动事件
   */
  function simpleScrollHandler(el) {
    // console.log('simpleScrollHandler...');
    let scrollToEl = null;
    let dy = document.documentElement.scrollTop;
    //console.log(dy);
    for (let i = allCatalogs.length - 1; i >= 0; i--) {
      if (allCatalogs[i].offsetTop <= dy) {
        scrollToEl = allCatalogs[i];
        break
      }
    }
    if (scrollToEl) setActiveItem(scrollToEl.id, false);
    else setActiveItem(null, false);
  }

  /**
   * 点击事件
   */
  function clickHandler({target}) {
    //console.log(target);
    const datasetId = target.parentElement.getAttribute(Opt.datasetName)
    target.parentElement.classList.contains(Opt.linkClass) &&
    document.getElementById(datasetId)
      .scrollIntoView();
    // .scrollIntoView({behavior: "smooth", block: "start"})
    setActiveItem(datasetId, true);
  }

  /**
   * 获取目录树，生成类似于Vnode的树
   * @param catalogs
   */
  function getCatalogsTree(catalogs) {
    let title, tagName, tree = [], treeItem = {}, parentItem = {id: -1}, lastTreeItem = null, id;

    for (let i = 0; i < catalogs.length; i++) {
      title = catalogs[i].innerText || catalogs[i].textContent;
      tagName = catalogs[i].tagName;
      id = 'heading-' + i;
      catalogs[i].id = id;
      treeItem = {
        name: title,
        tagName: tagName,
        id: id,
        level: +getLevel(tagName),
        parent: parentItem
      };
      if (lastTreeItem) {
        if (getLevel(treeItem.tagName) > getLevel(lastTreeItem.tagName)) {
          treeItem.parent = lastTreeItem
        } else {
          treeItem.parent = findParent(treeItem, lastTreeItem)
        }
      }
      lastTreeItem = treeItem;
      tree.push(treeItem)
    }
    return tree
  }

  /**
   * 找到当前节点的父级
   * @param currTreeItem
   * @param lastTreeItem
   * @returns {*|Window}
   */
  function findParent(currTreeItem, lastTreeItem) {
    let lastTreeParent = lastTreeItem.parent;
    while (lastTreeParent && (getLevel(currTreeItem.tagName) <= getLevel(lastTreeParent.tagName))) {
      lastTreeParent = lastTreeParent.parent
    }
    return lastTreeParent || {id: -1}
  }

  /**
   *  获取等级
   * @param tagName
   * @returns {*}
   */
  function getLevel(tagName) {
    return tagName ? tagName.slice(1) : 0
  }

  /**
   * 生成DOM树
   * @param tree
   * @param _parent
   * @return {string}
   */
  function generateHtmlTree(tree, _parent) {
    let ul, hasChild = false;
    if (tree) {
      ul = `<ul>`;
      for (let i = 0; i < tree.length; i++) {
        if (isEqual(tree[i].parent, _parent)) {
          if (tree[i].name !== '文章目录') {
            hasChild = true;
            ul += `<li  class='${Opt.linkClass} cl-level-${tree[i].level}' ${Opt.datasetName}='${tree[i].id}'><span>${tree[i].name}</span>`;
            ul += generateHtmlTree(tree, tree[i]);
            ul += '</li>';
          }
        }
      }
      ul += `</ul>`
    }
    return hasChild ? ul : ''
  }

  /**
   * 判断是否是相同节点
   */
  function isEqual(node, node2) {
    return node && node2 && typeof node === 'object' && typeof node2 === 'object' && node.id === node2.id
  }

  let isLastClick;

  /**
   *  设置选中的项
   */
  function setActiveItem(id, isClick) {
    if (isLastClick) {
      isLastClick = false;
      return;
    }
    isLastClick = isClick;
    if (id === null) {
      $catalog.scrollTop = 0;
    }
    //console.log('selected id -- > ' + id);
    let catas = [...$catalog.querySelectorAll(`[${Opt.datasetName}]`)];
    catas.forEach(T => {
      //console.log(T.getAttribute(Opt.datasetName));
      if (T.getAttribute(Opt.datasetName) === id) {
        typeof Opt.activeHook === 'function' &&
        !T.classList.contains(Opt.linkActiveClass) &&
        Opt.activeHook.call(this, T);
        T.classList.add(Opt.linkActiveClass);
        if (T.offsetTop > 300) {
          $catalog.scrollTop = T.offsetTop - 300;
        } else {
          $catalog.scrollTop = 0;
        }
      } else {
        T.classList.remove(Opt.linkActiveClass);
      }
    });
  }
};
