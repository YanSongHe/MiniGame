var nodeTools =
{
    getComponent:function (node, componentName)
    {
        if(node)
            return node.getComponent(componentName);

        console.error("getComponent is error: node is null");
        return null;
    },

    getNodeByName:function(nodeName, root)
    {
        var node = cc.find(nodeName, root);
        if(!node)
            console.error("getNodeByName is error: nodeName " + nodeName);

        return node;
    },

    getComponentByType:function(nodeName, componentName, root)
    {
        var node = this.getNodeByName(nodeName, root);
        return this.getComponent(node, componentName);
    },

    getWidget:function (nodeName, root)
    {
        return this.getComponentByType(nodeName, cc.Widget, root);
    },

    getButton:function(nodeName, root)
    {
        return this.getComponentByType(nodeName, cc.Button, root);
    },

    getLabel:function(nodeName, root)
    {
        return this.getComponentByType(nodeName, cc.Label, root);
    },
    
    getRichText:function(nodeName, root)
    {
        return this.getComponentByType(nodeName, cc.RichText, root);
    },
    
    getSprite:function(nodeName, root)
    {
        return this.getComponentByType(nodeName, cc.Sprite, root);
    },
    
    getEditBox:function(nodeName, root)
    {
        return this.getComponentByType(nodeName, cc.EditBox, root);
    },

    addClickListener:function(nodeName, listener, target, root)
    {
        var node = this.getNodeByName(nodeName, root);
        if(node)
            node.on("click", listener, target);
    },

    removeClickListener:function (nodeName, listener, target, root)
    {
        var node = this.getNodeByName(nodeName, root);
        if(node)
            node.off("click", listener, target);
    },

    addNodeClickListener:function(node, listener, target)
    {
        if(node)
            node.on("click", listener, target);
    },

    removeNodeClickListener:function(node, listener, target)
    {
        if(node)
            node.off("click", listener, target);
    },
    
    setButtonTitle:function(btn, title)
    {
        if(cc.js.isString(btn))
        {
            btn = this.getNodeByName(btn);
            if(btn == null)
            {
                console.log("#############setButtonTitle:no button:" + btn);
                return;
            }
        }

        var label = this.getLabel("Label", btn);
        label.string = title;
    },

    traversalNode:function(root, cb)
    {
        cb(root);
        for(var i = 0; i < root.children.length; ++i)
        {
            this.traversalNode(root.children[i], cb);
        }
    }
};

module.exports = nodeTools;