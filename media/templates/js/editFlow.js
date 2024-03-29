/**
 * Esta clase es usada para la edición de enlaces y el control de eventos que se ejecutan.
 * @author José Ruiz
 * @class TaskTerminalSalidaProxy
 * @augments WireIt.TerminalProxy
 * @constructor
 * @param {WireIt.Terminal} terminal Terminal padre
 * @param {Object} options Obejto de configuración
 */
TaskTerminalSalidaProxy = function(terminal, options) {
  TaskTerminalSalidaProxy.superclass.constructor.call(this, terminal, options);
};
YAHOO.lang.extend(TaskTerminalSalidaProxy, WireIt.TerminalProxy, {
  xtype: "TaskTerminalSalidaProxy",
  /**
   * Controla los eventos que se ejecutan al comenzar a arrastrar un enlace desde el terminal
   */
  startDrag: function(){
    var formInputs = this.terminal.container.form.inputs;
    var formFields  = this.terminal.container.fields;

    for(var i=0; i<formInputs.length; i++){

      if(formFields[i].name == 'out'){
        var outTermVal = formInputs[i].getValue();

        if(this.terminal.wires.length > 0 && outTermVal == 'none'){
          this.terminal.removeAllWires();
        }
      }
    }

    TaskTerminalSalidaProxy.superclass.startDrag.call(this);
  }
});


/**
 * Terminal de salida que usan las tareas para conectarse con otros elementos.
 * @author José Ruiz
 * @class TaskTerminalSalida
 * @augments WireIt.Terminal
 * @constructor
 * @param {HTMLElement} parentEl Elemento que contendrá al terminal
 * @param {Object} options Objeto de configuración
 * @param {WireIt.Container} container (Optional) Contenedor de este terminal
 */
TaskTerminalSalida = function(parentEl, options, container) {

 	TaskTerminalSalida.superclass.constructor.call(this, parentEl, options, container);

  // Crea un objeto TaskTerminalSalidaProxy asociado al terminal de salida
  this.dd = new TaskTerminalSalidaProxy(this, this.ddConfig);
};
YAHOO.lang.extend(TaskTerminalSalida, WireIt.Terminal, {
  xtype: "TaskTerminalSalida",
});


/**
 * Contenedor para elementos de tipo Tarea
 * @author José Ruiz
 * @class TaskContainer
 * @augments WireIt.FormContainer
 * @constructor
 * @param {Object}   opts Objeto de configuración
 * @param {WireIt.Layer}   layer Instancia de  WireIt.Layer que mantiene al contenedor
 */
TaskContainer = function(opts, layer) {
  TaskContainer.superclass.constructor.call(this, opts, layer);

  /**
    * @property opts
    * @description Opciones que describen un TaskContainer
    * @type String
    */
  this.opts = opts;

  /**
   * Agrega un listener al combobox tipo de split
   */
  YAHOO.util.Event.addListener(this.form.inputs[1].getEl(), "change", this.validateSplit, this, true);

  /**
   * Agrega un listener al input Id
   */
  YAHOO.util.Event.addListener(this.form.inputs[2].getEl(), "change", this.pushIdInHandler, this, true);
};
YAHOO.lang.extend(TaskContainer, WireIt.FormContainer, {
	 xtype: "TaskContainer",

  /**
   * Reescribe la clase render de WireIt.FormContainer para agragar el boton de clonar elementos
   */
  render: function(){
    TaskContainer.superclass.render.call(this);
    this.cloneButton = WireIt.cn('div', {className: "WireIt-Container-clonebutton"} );
    this.ddHandle.appendChild(this.cloneButton);
    YAHOO.util.Event.addListener(this.cloneButton, "click", this.onCloneButton, this, true);
  },

  /**
   * Valida que solo pueda crearse un enlace a partir del terminal de salida
   * si el campo split contiene el valor "none"
   */
  validateSplit: function(){
    if(this.form.inputs[1].getValue() == "none" &&
      this.terminals[1].wires.length > 1){
        this.terminals[1].removeAllWires();
    }
  },

  /**
   * Sustituye el título de la tarea por el valor del camo Id cada vez que este
   * cambia, si es vacio coloca el título por defecto
   */
  pushIdInHandler: function(){
    if(this.form.inputs[2].getValue() != undefined)
    {
      var childsDDHandle = this.ddHandle.getElementsByClassName("floatleft");
      var title = this.form.inputs[2].getValue().substr(0, 15);

      if(childsDDHandle[0]){
        this.ddHandle.replaceChild( WireIt.cn('span', {className: 'floatleft'}, null, title), childsDDHandle[0] );
      }
      
      if(this.form.inputs[2].getValue()==''){
        this.ddHandle.replaceChild( WireIt.cn('span', {className: 'floatleft'}, null, this.title), childsDDHandle[0] );
      }
    }
  },

  /**
   * Reescribe la funcion setValue para que actualice el titulo de la tarea
   * cuando se esta creando el elemento y ya se han asignado los valores por
   * defecto o valores guardados
   */
  setValue: function(val) {
    TaskContainer.superclass.setValue.call(this, val);
    this.setTitle();
  },

  /**
   * Invoca el metodo pushIdInHandler
   */
  setTitle: function() {
    this.pushIdInHandler();
  },
  
  /**
   * Clona una tarea dentro del layer, manteniendo todas sus caracteristicas
   */
  onCloneButton: function(e, args) {
    YAHOO.util.Event.stopEvent(e);
    var config = this.opts;

    config.position = [10,10];

    var container = this.layer.addContainer(config);
    YAHOO.util.Dom.addClass(container.el, "WiringEditor-module-"+config.name);
    container.setValue(this.getValue());
  }
});



/**
 * Contenedor para elementos de tipo Conexión
 * @author José Ruiz
 * @class LinkContainer
 * @augments WireIt.FormContainer
 * @constructor
 * @param {Object}   opts Objeto de configuración
 * @param {WireIt.Layer}   layer Instancia de  WireIt.Layer que mantiene al contenedor
 */
LinkContainer = function(opts, layer) {
  LinkContainer.superclass.constructor.call(this, opts, layer);

  /**
    * @property opts
    * @description Opciones que describen un LinkContainer
    * @type String
    */
  this.opts = opts;
};
YAHOO.lang.extend(LinkContainer, WireIt.FormContainer, {
	 xtype: "LinkContainer",

  /**
   * Reescribe la clase render de WireIt.FormContainer para agragar el boton de clonar elementos
   */
  render: function(){
    LinkContainer.superclass.render.call(this);

    this.cloneButton = WireIt.cn('div', {className: "WireIt-Container-clonebutton"} );
    this.ddHandle.appendChild(this.cloneButton);
    YAHOO.util.Event.addListener(this.cloneButton, "click", this.onCloneButton, this, true);
  },

  /**
   * Clona una conexión dentro del layer, manteniendo todas sus caracteristicas
   */
   onCloneButton: function(e, args) {
     YAHOO.util.Event.stopEvent(e);
     var config = this.opts;

     config.position = [10,10];

     var container = this.layer.addContainer(config);
     YAHOO.util.Dom.addClass(container.el, "WiringEditor-module-"+config.name);
     container.setValue(this.getValue());
   }
});


/**
 * Contenedor para elementos de tipo Variable
 * @author José Ruiz
 * @class VariableContainer
 * @augments WireIt.FormContainer
 * @constructor
 * @param {Object}   opts Objeto de configuración
 * @param {WireIt.Layer}   layer Instancia de  WireIt.Layer que mantiene al contenedor
 */
VariableContainer = function(opts, layer) {
  VariableContainer.superclass.constructor.call(this, opts, layer);

  /**
    * @property opts
    * @description Opciones que describen un VariableContainer
    * @type String
    */
  this.opts = opts;

};

YAHOO.lang.extend(VariableContainer, WireIt.FormContainer, {
	 xtype: "VariableContainer",

  /**
   * Reescribe la clase render de WireIt.FormContainer para agragar el boton de clonar elementos
   */
  render: function(){
    VariableContainer.superclass.render.call(this);

    this.cloneButton = WireIt.cn('div', {className: "WireIt-Container-clonebutton"} );
    this.ddHandle.appendChild(this.cloneButton);
    YAHOO.util.Event.addListener(this.cloneButton, "click", this.onCloneButton, this, true);
  },

  /**
   * Clona una conexión dentro del layer, manteniendo todas sus caracteristicas
   */
   onCloneButton: function(e, args) {
     YAHOO.util.Event.stopEvent(e);
     var config = this.opts;

     config.position = [10,10];

     var container = this.layer.addContainer(config);
     YAHOO.util.Dom.addClass(container.el, "WiringEditor-module-"+config.name);
     container.setValue(this.getValue());
   }
});


/**
 * Contenedor para elementos de tipo AutoFiltro
 * @author José Ruiz
 * @class FilterContainer
 * @augments WireIt.FormContainer
 * @constructor
 * @param {Object}   opts Objeto de configuración
 * @param {WireIt.Layer}   layer Instancia de  WireIt.Layer que mantiene al contenedor
 */
FilterContainer = function(opts, layer) {
  FilterContainer.superclass.constructor.call(this, opts, layer);

  /**
    * @property opts
    * @description Opciones que describen un FilterContainer
    * @type String
    */
  this.opts = opts;
};
YAHOO.lang.extend(FilterContainer, WireIt.FormContainer, {
	 xtype: "FilterContainer",

  /**
   * Reescribe la clase render de WireIt.FormContainer para agragar el boton de clonar elementos
   */
  render: function(){
    FilterContainer.superclass.render.call(this);

    this.cloneButton = WireIt.cn('div', {className: "WireIt-Container-clonebutton"} );
    this.ddHandle.appendChild(this.cloneButton);
    YAHOO.util.Event.addListener(this.cloneButton, "click", this.onCloneButton, this, true);
  },

  /**
   * Clona un autofiltro dentro del layer, manteniendo todas sus caracteristicas
   */
  onCloneButton: function(e, args) {
    YAHOO.util.Event.stopEvent(e);
    var config = this.opts;

    config.position = [10,10];

    var container = this.layer.addContainer(config);
    YAHOO.util.Dom.addClass(container.el, "WiringEditor-module-"+config.name);
    container.setValue(this.getValue());
   }
});

/**
 * Hace el llamado al Editor utilizando el lenguaje editFlowLanguage
 */
YAHOO.util.Event.onDOMReady( function() {

  try {

    //editFlowLanguage.adapter = WireIt.WiringEditor.adapters.IndexedDB;
    var editor = new FlowEditor(editFlowLanguage);
    //editor.onNew();
  }

  catch(ex) {
    console.log(ex);
  }
});




/**
 * Genera un archivo XML a partir de un flujo
 * @class XmlFile
 * @author José Ruiz
 * @static
 */

var XmlFile = {

 /**
  * Escribe la sección de cabecera del archivo XML.
  * @static
  */
  writeHeader: function(properties)
  {
    var xmlFile='';

    xmlFile += '<?xml version="1.0" encoding="UTF-8" ?>\n';
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '<!--\nDescripcion: Archivo generado por SAFET-EditFlow\n-->\n';
    xmlFile += '<!DOCTYPE yawl SYSTEM "'+properties.dtd_path+'">\n';
    xmlFile += '<yawl  version="0.01">\n';

    return xmlFile;
  },


 /**
  * Analiza y transforma caracteres especiales dentro de los campos
  * @method parseStrInputValues
  * @static
  * @param {String} str
  */
  parseStrInputValues: function(str)
  {
   str = str.replace(/[>]/g, "{{gt}}");
   str = str.replace(/</g, "{{lt}}");
   return str;
  },

 /**
  * Escribe la sección sub-cabecera del archivo XML
  * @static
  */
  writeSubHeader: function(properties)
  {
    var xmlFile='';

    if(properties.name=='' || properties.name==undefined ||
       properties.token_key=='' || properties.token_key==undefined ||
       properties.token_keysource=='' || properties.token_keysource==undefined)
    {
      return this.errorMsg('Faltan propiedades por definir');
    }
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '<!-- Incio Flujo de Trabajo -->\n';

    xmlFile += '<workflow id="'+properties.name+'" desc="'+properties.description+'">\n';
    xmlFile += '<token key="'+properties.token_key+'"  keysource="'+properties.token_keysource+'">\n';
    xmlFile += '</token>\n';

    return xmlFile;
  },


 /**
  * Writes the Start condition for the XML file.
  * @method writeStartCondition
  * @static
  * @param {Object} wiring configuration
  * @param {Integer} element position into the wiring
  */
  writeStartCondition: function(wiring, moduleId)
  {
    var xmlFile = '';
    var numlinks = 0;
    var xmlConn = '';
    var properties = wiring.properties;

    //Put the initial condition in the string
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '  <!-- Incio Condición Inicial -->\n';
    var srcModule = wiring.modules[moduleId];
    var left = srcModule.config.position[0]  || '';
    var top = srcModule.config.position[1]  || '';
    xmlFile += '  <condition id="inicial" type="start" left="'+left+'" top="'+top+'">\n';

    //loops through everyone of destinations of every task
    for(var j = 0 ; j < wiring.wires.length ; j++)
    { 
      var n = wiring.wires[j];

      if(n.src.moduleId==moduleId) 
      {
        numlinks++;
        
        var linkModule = wiring.modules[n.tgt.moduleId];
        
        for(var k = 0 ; k < wiring.wires.length ; k++)
        {
          var m = wiring.wires[k];

          if(m.src.moduleId==n.tgt.moduleId)
          {
            var tgtModule = wiring.modules[m.tgt.moduleId];
            var left = linkModule.config.position[0]  || '';
            var top = linkModule.config.position[1]  || '';

            //Valida la obligatoriedad de algunos campos
            if(tgtModule.value.id=='' || tgtModule.value.id == undefined)
              return this.errorMsg('Error en el flujo: Existen tareas sin Id');
            if(linkModule.value.query=='' || linkModule.value.query == undefined)
              return this.errorMsg('Error en el flujo: Existen Conexiones sin Query');

            var id = XmlFile.parseStrInputValues(tgtModule.value.id)  || '';
            var query = XmlFile.parseStrInputValues(linkModule.value.query)  || '';
            var options = XmlFile.parseStrInputValues(linkModule.value.options)  || '';
            var tokenlink = XmlFile.parseStrInputValues(linkModule.value.tokenlink)  || '';

            xmlConn += '      <connection source="'+id+'" ';
            xmlConn += 'query="'+query+'" ';
            xmlConn += 'options="'+options+'" ';
            xmlConn += 'tokenlink="'+tokenlink+'" ';
            xmlConn += 'left="'+left+'" top="'+top+'">\n';
            xmlConn += '      </connection>\n';

          }
        }
      }
    }

    // Si la condición inicial tiene mas de un enlace el pattern es "or"    
    var pattern = (numlinks > 1 ? 'pattern="or"' : '');    

    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '    <!-- Puertos Condición Inicial -->\n';
    xmlFile += '    <port side="forward" type="split" '+pattern+'>\n';


    xmlFile += xmlConn;

    xmlFile += '    </port>\n';
    xmlFile += '  </condition>\n';
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '  <!-- Fin Condición Inicial -->\n';

    return xmlFile;
  },


 /**
  * Writes the end condition for the XML file.
  * @method writeEndCondition
  * @static
  */
  writeEndCondition: function(wiring, moduleId)
  {
    var xmlFile='';
    var properties = wiring.properties;
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '  <!-- Inicio Condición Final -->\n';
    var module = wiring.modules[moduleId];
    var left = module.config.position[0]  || '';
    var top = module.config.position[1]  || '';

    xmlFile += '  <condition id="final" ';
    xmlFile += 'left="'+left+'" top="'+top+'">\n';
    xmlFile += '    <port side="forward" type="split">\n';
    xmlFile += '      <connection source="">\n';
    xmlFile += '      </connection>\n';
    xmlFile += '    </port>\n';
    xmlFile += '  </condition>\n';
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '  <!-- Fin Condición Final -->\n';

    //Close
    xmlFile += '</workflow>\n';
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '<!-- Fin Flujo de Trabajo -->\n';
    xmlFile += '</yawl>\n';

    return xmlFile;
  },

 /**
  * Writes one Task for the XML file.
  * @method writeTask
  * @static
  * @param {Object} wiring configuration
  * @param {Integer} element position into the wiring
  */
  writeTask: function(wiring, i)
  {
    var xmlFile='';
    var xmlVar='';
    var xmlFilters='';
    var m = wiring.modules[i];
    var nVariable = 0;
    var properties = wiring.properties;

    if(wiring.modules[i].name!="Tarea")
      return xmlFile;
    
    if(m.value.id=='' || m.value.id == undefined)
               return this.errorMsg('Error en el flujo: Existen tareas sin Id');

    var id = m.value.id || '';
    var titulo = m.value.content || '';
    var left = m.config.position[0]  || '';
    var top = m.config.position[1]  || '';
    // Genera la descripción en XMl de una tarea
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '  <!-- Inicio Tarea "'+id+'" -->\n';
    xmlFile += '  <task id="'+m.value.id+'" title="'+titulo+'" ';
    xmlFile += (m.value.textualinfo!='' ? 'textualinfo="'+m.value.textualinfo+'"' : '')+' ';
    xmlFile += (m.value.report=="yes" ? 'report="yes" ' : ' ');
    xmlFile += 'left="'+left+'" top="'+top+'"'+'>\n';
    //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '    <!-- Puertos Tarea "'+m.value.id+'" -->\n';
    xmlFile += '    <port side="forward" type="split" ';

    if(m.value.out && m.value.out!='none')
      xmlFile += 'pattern="'+m.value.out+'"';

    xmlFile += '>\n';

     // Recorre cada uno de los destinos de cada tarea
     for(j = 0 ; j < wiring.wires.length ; j++)
     {
       var n = wiring.wires[j];

       if(wiring.modules[n.tgt.moduleId].name=='Conexión')
       {
        
         var linkModule = wiring.modules[n.tgt.moduleId];
         var left = linkModule.config.position[0]  || '';
         var top = linkModule.config.position[1]  || '';

         for(var k = 0 ; k < wiring.wires.length ; k++)
         {
           var m = wiring.wires[k];

           if(m.src.moduleId==n.tgt.moduleId)
           {
             var tgtModule = wiring.modules[m.tgt.moduleId];

              if(linkModule.value.query=='' || linkModule.value.query == undefined)
               return this.errorMsg('Error en el flujo: Existen Conexiones sin Query');
             
             if(tgtModule.name=='Condición Final')
             {
               var source = 'final';
               ending = true;
             }
             else
             { 
               var source = tgtModule.value.id;
               if(source=='' || source == undefined)
                 return this.errorMsg('Error en el flujo: Existen tareas sin Id');
             }
             var options = XmlFile.parseStrInputValues(linkModule.value.options) || '';
             var tokenlink = XmlFile.parseStrInputValues(linkModule.value.tokenlink) || '';
             var query = XmlFile.parseStrInputValues(linkModule.value.query) || '';
             
            }
           }
         

         if(n.src.moduleId==i)
         {
           xmlFile += '      <connection  source="'+source+'" ';
           xmlFile += 'query="'+query+'" options="'+options+'" tokenlink="'+tokenlink+'" ';
           xmlFile += 'left="'+left+'" top="'+top+'">\n';
           xmlFile += '      </connection>\n';
         }
       }
       
       /**
        * Genera la descripción en XML de una variable
        */

       if(wiring.modules[n.tgt.moduleId].name=='Variable')
       {
         var mod_tgt = wiring.modules[n.tgt.moduleId];
         var idv = mod_tgt.value.id || '';
         var type = mod_tgt.value.type || '';
         var documentsource = mod_tgt.value.documentsource || '';
         var tokenlink = mod_tgt.value.tokenlink || '';
         var rolfield = mod_tgt.value.rolfield || '';
         var timestampfield = mod_tgt.value.timestampfield || '';
         var left = mod_tgt.config.position[0]  || '';
         var top = mod_tgt.config.position[1]  || '';

          if(idv=='' || idv == undefined)
                 return this.errorMsg('Error en el flujo: Existen variables sin Id');
          if(documentsource=='' || documentsource == undefined)
                 return this.errorMsg('Error en el flujo: Existen variables sin DocSrc');

         if(n.src.moduleId==i)
         {
           nVariable++;
           xmlVar += '      <variable  id="'+idv+'" scope="task" config="1" ';
           xmlVar += (tokenlink!='' ? 'tokenlink="'+tokenlink+'" ': '');
           xmlVar += (rolfield!='' ? 'rolfield="'+rolfield+'" ': '');
           xmlVar += (timestampfield!='' ? 'timestampfield="'+timestampfield+'" ': '');
           xmlVar += 'type="'+type+'" documentsource="'+documentsource+'" ';
           xmlVar += 'left="'+left+'" top="'+top+'">\n';
           xmlVar += '      </variable>\n';
         }

       }

       /**
        * Genera las descripción en XML de los Autofilters
        */
       if(wiring.modules[n.tgt.moduleId].name=='Autofiltro' && n.tgt.terminal=='asociativo')
       {
         var ida = wiring.modules[n.tgt.moduleId].value.id || '';
         var query = wiring.modules[n.tgt.moduleId].value.query || '';
         var report = wiring.modules[n.tgt.moduleId].value.report || '';
         var type = wiring.modules[n.tgt.moduleId].value.type || '';
         var tokenlink = wiring.modules[n.tgt.moduleId].value.tokenlink || '';
         var left = wiring.modules[n.tgt.moduleId].config.position[0]  || '';
         var top = wiring.modules[n.tgt.moduleId].config.position[1]  || '';

          if(ida=='' || ida == undefined)
                 return this.errorMsg('Error en el flujo: Existen autofilters sin Id');
          if(query=='' || query == undefined)
                 return this.errorMsg('Error en el flujo: Existen autofilters sin Query');
         
         for(var k = 0 ; k < wiring.wires.length ; k++)
         {
           var m = wiring.wires[k];
           if(m.src.terminal == "source" && m.src.moduleId == n.tgt.moduleId)
             var sourcef = wiring.modules[m.tgt.moduleId].value.id;
           if(m.tgt.terminal == "source" && m.tgt.moduleId == n.tgt.moduleId)
             var sourcef = wiring.modules[m.src.moduleId].value.id;
         }

         if(n.src.moduleId==i && sourcef != undefined)
         {
           xmlFilters += '      <autofilter  id="'+ida+'" source="'+sourcef+'" ';
           xmlFilters += 'type="'+type+'" query="'+query+'" ';
           xmlFilters += 'report="'+report+'"  tokenlink="'+tokenlink+'" ';
           xmlFilters += 'left="'+left+'"  top="'+top+'">\n';
           xmlFilters += '      </autofilter>\n';
         }

       }
       
     }

      if(nVariable == 0)
               return this.errorMsg('Error en el flujo: Existen tareas sin Variable');

     xmlFile += '    </port>\n';
     xmlFile += xmlVar;
     xmlFile += xmlFilters;
     xmlFile += '  </task>\n';
     //Comentarios solo si esta activada la opción
    if(properties.comments==true) xmlFile += '  <!-- Fin Tarea "'+id+'" -->\n';
    return xmlFile;
  },


 /**
  * Envia los mensajes de error al usuario.
  * @method errorMsg
  * @static
  * @param {String} message
  */
  errorMsg: function(msg)
  {
    alert(msg);
    return false;
  }
}


/**
 * Declara flowEditor que extiende WiringEditor para poder personalizarlo
 */
FlowEditor = function(options)
{
  FlowEditor.superclass.constructor.call(this, options);

  // Renderiza Panel para cargar XML
  this.renderLoadXMLPanel();
  // Renderiza Panel para cargar JSON
  this.renderLoadJsonPanel();
};

YAHOO.lang.extend(FlowEditor, WireIt.WiringEditor,
{
  /**
   * Overwrite renderButtons function
   */

  /**
  * @method renderButtons
  */
  renderButtons: function() {

    var toolbar = YAHOO.util.Dom.get('toolbar');
    // Buttons :
    var newButton = "";

    var loadButton = "";

    var saveButton = new YAHOO.widget.Button({label:"Guardar", id:"WiringEditor-saveButton", container: toolbar});
    saveButton.on("click", this.onDownload, this, true);

    var helpButton = new YAHOO.widget.Button({label:"Ayuda", id:"WiringEditor-helpButton", container: toolbar});
    helpButton.on("click", this.onHelp, this, true);
   },

  /**
   * Metodo que se ejecuta para generar el archivo XML que describe el flujo
   * de trabajo mostrado en el lienzo
   * @method onDownload
   */

  onDownload: function(file_name) {

    var value = this.getValue();
    // Hace una copia del objeto
    var wiring_all = {};
    YAHOO.lang.augmentObject(wiring_all, value);

    var result;

    var wiring = wiring_all.working;

    ending = false;

    xmlFile = XmlFile.writeHeader(wiring.properties);

    result = XmlFile.writeSubHeader(wiring.properties);
    if(result)  xmlFile += result; else return result;

    if(YAHOO.lang.isArray(wiring.modules)) {
      for(i = 0 ; i < wiring.modules.length ; i++) {
        var m = wiring.modules[i];
        // Si es una condición inicial
        if(m.name=='Condición Inicial') {
          result = XmlFile.writeStartCondition(wiring, i);
          if(result)  xmlFile += result; else return result;
        }

        //Si es una condición final
        if(m.name=='Condición Final') {
          var endCondition = XmlFile.writeEndCondition(wiring, i);
          if(!endCondition)  return endCondition;
        }

        // Si es una tarea
        if(m.name=='Tarea') {
          result = XmlFile.writeTask(wiring, i);
          if(result)  xmlFile += result; else return result;
        }
      }

      xmlFile += endCondition;
      if(!ending)
        return XmlFile.errorMsg('Error en el flujo: No hay finalización del flujo');
    }

    editor = this;
    var callbackSave = {
      success: function(o) {
        if(o.responseText == 'ok'){
          alert('El flujo se ha guardado exitosamente');
          editor.markSaved();
        }
        else
          alert('El flujo no ha podido guardarse');
      },
      failure: function(o) {alert('El flujo no ha podido guardarse')}
    };
    
    xmlFile = xmlFile.replace(/[\n]/g, "\\n");
    //alert(xmlFile);
    var transaction = YAHOO.util.Connect.asyncRequest('POST', '/index.py/save', callbackSave, 'name='+xmlFileName+'&xml_str='+xmlFile);
    //alert(transaction.toSource());
  },

  /**
   * Metodo que se ejecuta para generar el archivo JSON que describe el flujo
   * de trabajo mostrado en el lienzo
   * @method onDownloadJson
   */

  onDownloadJson: function() {

    var value = this.getValue();

    // Hace una copia del objeto
    var wiring_all = {};
    YAHOO.lang.augmentObject(wiring_all, value);

    var wiring = YAHOO.lang.JSON.stringify(wiring_all);

    //window.open('data:application/force-download;base64,'+Base64.encode(xmlFile), 'XML File');
    //window.open('data:application/json;base64,'+Base64.encode(wiring), 'JSON File');
    window.open('data:text/plain;base64,'+Base64.encode(wiring), 'JSON File');

  },

  /**
   * @method onLoadXML
   */
  onLoadXML: function() {
    this.loadXMLPanel.show();
  },

  /**
   * Renderiza el panel para cargar un archivo XML
   * @method renderLoadXMLPanel
   */
  renderLoadXMLPanel: function() {
    this.loadXMLPanel = new YAHOO.widget.Panel('loadXMLPanel', {
      fixedcenter: true,
      draggable: true,
      visible: false,
      modal: true
     });

     this.loadXMLPanel.render();

     YAHOO.util.Event.addListener("xmlButton", "click", this.loadXML, this, true);
   },

  /**
   * Metodo que toma del textarea la descripción en XML de un flujo de trabajo
   *  y lo carga en el lienzo
   * @method loadXML
   */
  loadXML: function() {
    //Ocultar panel
//    if(this.loadXMLPanel) {
//      this.loadXMLPanel.hide();
//    }
//
    //Obtener valor del campo que contiene el XML
    var xmlContent = document.getElementById('xmlArea').value;
    //alert(xmlContent);
    if (window.DOMParser){ //FF, Chrome
      parser = new DOMParser();
      xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    }
    else //Explorer
    {
      xmlDoc = new ActiveXObject('Microsoft.XMLDOM');
      xmlDoc.async = 'false';
      xmlDoc.loadXML(xmlContent);
    }

    //Obtiene a través de patrones la ruta al dtd especificado en el DOCTYPE
    var exp = new RegExp("^<!DOCTYPE.*>$"); //patron para obtener DOCTYPE
    
    var lines =  xmlContent.split("\n"); //Se divide el contenido XML en lineas
    //Se itera sobre cada una de las lineas hasta encontrar el  DOCTYPE
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if(line.match(exp)){
        var expL = new RegExp("file:/.*\.dtd"); //patron para obtener DOCTYPE
        var dtdPath = line.match(expL);
        
      }
    }
    posJsonFormat={}; //Variable que contienen las posiciones de los elementos en el JSON

    posJson=0; // Contador de las posiciones ocupadas en el arreglo de elementos

    jsonModules=''; //Almacena la cadena que describe los módulos en formato JSON

    jsonWires=''; //Almacena la cadena que describe los wires en formato JSON


    var jsonFormat = '{"working":{"modules":[';

    this.followRoad('inicial', 0, xmlDoc);

    var workflow = xmlDoc.documentElement.getElementsByTagName('workflow')[0];
    var id = (workflow.attributes.getNamedItem("id") ? workflow.attributes.getNamedItem("id").nodeValue : '');
    var desc = (workflow.attributes.getNamedItem("desc") ? workflow.attributes.getNamedItem("desc").nodeValue : '');

    var token = xmlDoc.documentElement.getElementsByTagName('token')[0];
    var key = (token.attributes.getNamedItem("key") ? token.attributes.getNamedItem("key").nodeValue : '');
    var keysource = (token.attributes.getNamedItem("keysource") ? token.attributes.getNamedItem("keysource").nodeValue : '');

    ////////////////////////////////////////////////////////////////////////////

    /**
     * Genera la descripcion de los autofiltros
     */

    var boxesWidth = 250;   // Espacio aproximado que ocupa cada elemento
                            // en el lienzo horizontalmente
    var posY = 232;         // Posición de origen de los elementos en el eje Y

    var autofilters = xmlDoc.documentElement.getElementsByTagName('autofilter');

    for(var i = 0, j=0; i<autofilters.length; i++,j++) {

      var autofilter = autofilters[i];
      var task = autofilter.parentNode;
      var tgtTask = autofilter.attributes.getNamedItem('source');


      // Crea el elemento autofilter
      var filterId    = (autofilter.attributes.getNamedItem("id") ?  autofilter.attributes.getNamedItem("id").nodeValue : '');
      var report    = (autofilter.attributes.getNamedItem("report") ?  autofilter.attributes.getNamedItem("report").nodeValue : '');
      var query  = (autofilter.attributes.getNamedItem("query") ?  autofilter.attributes.getNamedItem("query").nodeValue : '');
      var type  = (autofilter.attributes.getNamedItem("type") ?  autofilter.attributes.getNamedItem("type").nodeValue : '');
      var left    = (autofilter.attributes.getNamedItem("left") ?  autofilter.attributes.getNamedItem("left").nodeValue : '');
      var top     = (autofilter.attributes.getNamedItem("top") ?  autofilter.attributes.getNamedItem("top").nodeValue : '');

      //Posición del elemento
      var srcPos = this.findInIndex('task&'+task.attributes.getNamedItem('id').nodeValue);
      var j = (lastSrcPos == srcPos ? j:0);
      var lastSrcPos = srcPos;
      var tgtPos = this.findInIndex('task&'+tgtTask.nodeValue);
      var posAutoX = boxesWidth*srcPos+200;
          posAutoY = posY+100+50*j;

      if(left=='' || top =='') {
        jsonModules += ',{"name":"Autofiltro","value":{"id":"'+filterId+'","query":"'+query+'","report":"'+report+'","type":"'+type+'","color":"#FFFFFF"},"config":{"position":['+posAutoX+','+posAutoY+'],"xtype":"FilterContainer"}}';
      }
      else {
        jsonModules += ',{"name":"Autofiltro","value":{"id":"'+filterId+'","query":"'+query+'","report":"'+report+'","type":"'+type+'","color":"#FFFFFF"},"config":{"position":['+left+','+top+'],"xtype":"FilterContainer"}}';
      }
      posJsonFormat[posJson] = 'filter&'+filterId;
      posJson++;

      // Wires que conectan el autofiltro con las dos tareas
      jsonWires += ',{"xtype":"WireIt.BezierWire","src":{"moduleId":'+srcPos+',"terminal":"asociativo"},"tgt":{"moduleId":'+(posJson-1)+',"terminal":"asociativo"}}';
      jsonWires += ',{"xtype":"WireIt.BezierWire","src":{"moduleId":'+(posJson-1)+',"terminal":"source"},"tgt":{"moduleId":'+tgtPos+',"terminal":"asociativo"}}';
    }
    ////////////////////////////////////////////////////////////////////////////


    jsonFormat += jsonModules+'],"wires":['+jsonWires+']';
    jsonFormat += ',"properties":{"name":"'+id+'","description":"'+desc+'","token_key":"'+key+'","token_keysource":"'+keysource+'","auto_conn":true'+',"dtd_path":"'+dtdPath+'","comments":true}}}';

    jsonFormatParsed = YAHOO.lang.JSON.parse(jsonFormat);

    this.layer.clear();   // Limpia el lienzo
    this.propertiesForm.setValue(jsonFormatParsed.working.properties, false); //Asigna las propiedades
    this.drawEvents(jsonFormatParsed.working); //Dibuja los elementos

 },

  /**
   * @method onLoadJson
   */
  onLoadJson: function() {
    this.loadJsonPanel.show();
  },

  /**
   * Renderiza el panel para cargar un archivo JSON
   * @method renderLoadJsonPanel
   */
  renderLoadJsonPanel: function() {
    this.loadJsonPanel = new YAHOO.widget.Panel('loadJsonPanel', {
      fixedcenter: true,
      draggable: true,
      visible: false,
      modal: true
     });

     this.loadJsonPanel.render();

     YAHOO.util.Event.addListener("jsonButton", "click", this.loadJson, this, true);
   },

  /**
   * Metodo que toma del textarea la descripción en JSON de un flujo de trabajo
   *  y lo carga en el lienzo
   * @method loadJson
   */
  loadJson: function() {
    //Ocultar panel
    if(this.loadJsonPanel) {
      this.loadJsonPanel.hide();
    }

    //Obtener valor del campo que contiene el json
    var jsonFormat = document.getElementById('jsonArea').value;

    jsonFormatParsed = YAHOO.lang.JSON.parse(jsonFormat);

    this.layer.clear();   // Limpia el lienzo
    this.propertiesForm.setValue(jsonFormatParsed.working.properties, false); //Asigna las propiedades
    this.drawEvents(jsonFormatParsed.working); //Dibuja los elementos

 },



  /**
   * Encuentra la cadena que coincida con la expresión regular suministrada
   * y devuelve la posición en el arreglo posJsonFormat
   * @method findInIndex
   * @param {String} expr
   */
 findInIndex: function(expr) {
   var expreg = new RegExp(expr);
   for(var k=0; k<posJson; k++) {
     //si encuentra en el indice la expresion reg
     if(posJsonFormat[k].search(expreg)>-1) {
       return k;
     }
   }
   return -1;
 },
 
  /**
   * Encuentra una tarea en el xmlDoc suministrado dado su id y retorna el elemento
   * @method getTaskInXmlById
   * @param {String} id
   * @param {Object} xmlDoc
	  */
  getTaskInXmlById: function(id, xmlDoc) {
    var element = xmlDoc.documentElement.getElementsByTagName('task');

    for(var i = 0; i<element.length; i++) {
      var task = (element[i].attributes.getNamedItem("id") ?  element[i].attributes.getNamedItem("id").nodeValue : '');
      if(task==id)
        return element[i];
    }
    return '';
 },

  /**
   * recorre de manera recursiva y en un recorrido pre-orden todos los elementos
   * (Conexiones y Tareas) del flujo en el archivo XML
   * @method followRoad
   * @param {String} id
   * @param {Integer} posId
   * @param {Object} xmlDoc
   */
  followRoad: function(id, posId, xmlDoc) {

    var boxesWidth = 250;  // Espacio aproximado que ocupa cada elemento
                          // en el lienzo horizontalmente
    var connecVar = 0;   // Despalzamiento hacia arriba o hacia abajo aplicado
                          // a los elementos de tipo Conexión
    var variableVar = 80;   // Despalzamiento hacia arriba o hacia abajo aplicado
                          // a los elementos de tipo Variable
    var posY = 232;        // Posición de origen de los elementos en el eje Y
    var posYConn=0;        // Variable para almacenar la posición de las
                          // conexiones en el eje Y

   /**
    * Procedimiento cuando el id es la condicion inicial
    */
    if(id=='inicial') {
      var conditions = xmlDoc.documentElement.getElementsByTagName("condition") || '';

      for(var i=0; i<conditions.length; i++){

        var condition = conditions[i] || '';
         // si existe una condicion entra
         if(condition != ''){

           if(condition.attributes.getNamedItem("id").nodeValue == "inicial") {
             var left    = (condition.attributes.getNamedItem("left") ?  condition.attributes.getNamedItem("left").nodeValue : '');
             var top     = (condition.attributes.getNamedItem("top") ?  condition.attributes.getNamedItem("top").nodeValue : '');
             if(left=='' || top =='') {
              jsonModules += '{"name":"Condición Inicial","value":{},"config":{"position":[4,'+posY+'],"xtype":"WireIt.ImageContainer"}}';
             }
             else {
              jsonModules += '{"name":"Condición Inicial","value":{},"config":{"position":['+left+','+top+'],"xtype":"WireIt.ImageContainer"}}';
             }
             posJsonFormat[posJson] = "inicial";
             posJson++;

             /**
             * Conexiones de la condición inicial
             */
             var port = condition.getElementsByTagName("port")[0];
             var connections = port.getElementsByTagName("connection");

             for(var j=0; j<connections.length;j++) {

               var connection = connections[j] || '';
               var connSrc    = (connection.attributes.getNamedItem("source") ?  connection.attributes.getNamedItem("source").nodeValue : '');
               var connOpt    = (connection.attributes.getNamedItem("options") ?  connection.attributes.getNamedItem("options").nodeValue : '');
               var connQuery  = (connection.attributes.getNamedItem("query") ?  connection.attributes.getNamedItem("query").nodeValue : '');
               var connTlink  = (connection.attributes.getNamedItem("tokenlink") ?  connection.attributes.getNamedItem("tokenlink").nodeValue : '');
               var left    = (connection.attributes.getNamedItem("left") ?  connection.attributes.getNamedItem("left").nodeValue : '');
               var top     = (connection.attributes.getNamedItem("top") ?  connection.attributes.getNamedItem("top").nodeValue : '');

               if(this.findInIndex('connection&inicial&'+j) < 0) {
                 // Calcula la posición en X y Y de el elemento a dibujar
                 var posX = boxesWidth*posJson;
                 posYConn = posY-connecVar;
                 //////
                 if(left=='' || top =='') {
                   jsonModules += ',{"name":"Conexión","value":{"options":"'+connOpt+'","query":"'+connQuery+'","tokenlink":"'+connTlink+'","color":"#FFFFFF"},"config":{"position":['+posX+','+posYConn+'],"xtype":"LinkContainer"}}';
                 }
                 else {
                   jsonModules += ',{"name":"Conexión","value":{"options":"'+connOpt+'","query":"'+connQuery+'","tokenlink":"'+connTlink+'","color":"#FFFFFF"},"config":{"position":['+left+','+top+'],"xtype":"LinkContainer"}}';
                 }
                 posJsonFormat[posJson] = 'connection&inicial&'+j;
                 posJson++;
               }

               // Crea el Wire entre los dos elementos
               var srcPos = this.findInIndex(id);
               var tgtPos = this.findInIndex('connection&inicial&'+j);

               jsonWires += (j>0 ? ',':'');
               jsonWires += '{"xtype":"WireIt.BezierArrowWire","src":{"moduleId":'+srcPos+',"terminal":"salida"},"tgt":{"moduleId":'+tgtPos+',"terminal":"entrada"}}';

               this.followRoad('connection&inicial&'+j, i, xmlDoc);
             }
           }
         }
       }
     }
   /////////////////////////////////////////////////////////////////////////////

    /**
     * Procedimiento cuando el id es de un elemento conexión
     */
    var regexp = new RegExp('connection&');

    if(id.search(regexp) > -1) {
      var idArr = id.split('&');
      var idEl  = idArr[1];
      var idxEl = idArr[2];

      if(idEl=='inicial') {
        tagSrch = "condition";
        var element = xmlDoc.documentElement.getElementsByTagName(tagSrch)[posId];
      }
      else {
        var element = this.getTaskInXmlById(idEl, xmlDoc);
      }     
      
      var port = element.getElementsByTagName("port")[0];
      var connection = port.getElementsByTagName("connection")[idxEl];
      var connSrc    = (connection.attributes.getNamedItem("source") ?  connection.attributes.getNamedItem("source").nodeValue : '');

      if(connSrc != 'final') {
        var nextEl = this.getTaskInXmlById(connSrc, xmlDoc);
        var taskId      = connSrc;
        var taskTitle   = (nextEl.attributes.getNamedItem("title") ?  nextEl.attributes.getNamedItem("title").nodeValue : 'no');
        var taskReport  = (nextEl.attributes.getNamedItem("report") ?  nextEl.attributes.getNamedItem("report").nodeValue : 'no');
        var taskTxtInfo = (nextEl.attributes.getNamedItem("textualinfo") ?  nextEl.attributes.getNamedItem("textualinfo").nodeValue : '');
        var left        = (nextEl.attributes.getNamedItem("left") ?  nextEl.attributes.getNamedItem("left").nodeValue : '');
        var top         = (nextEl.attributes.getNamedItem("top") ?  nextEl.attributes.getNamedItem("top").nodeValue : '');

        //Obtiene el puerto forward de la tarea y el pattern para este
        var patternOut='none';
        var ports = nextEl.getElementsByTagName("port");
        for(var i = 0; i< ports.length; i++) {
          if(ports[i].attributes.getNamedItem('side').nodeValue=='forward')
            patternOut = (ports[i].attributes.getNamedItem("pattern") ?  ports[i].attributes.getNamedItem("pattern").nodeValue : '');
        }
        var followit=false;
        if(this.findInIndex('task&'+taskId) < 0) {  // Si el elemento no ha sido insertado
          //Si recien se  inserta la tarea debe explorarse sus conexiones de lo contrario no porque caeria en un bucle infinito
          followit=true;
          // Calcula la posición en X y Y de el elemento a dibujar
          var posX = boxesWidth*posJson;

          if(left=='' || top =='') {
            jsonModules += ',{"name":"Tarea","value":{"in":"none","out":"'+patternOut+'","id":"'+taskId+'","textualinfo":"'+taskTxtInfo+'","content":"'+taskTitle+'","report":"'+taskReport+'","color":"#FFFFFF"},"config":{"position":['+posX+','+posY+'],"xtype":"TaskContainer"}}';
          }
          else {
            jsonModules += ',{"name":"Tarea","value":{"in":"none","out":"'+patternOut+'","id":"'+taskId+'","textualinfo":"'+taskTxtInfo+'","content":"'+taskTitle+'","report":"'+taskReport+'","color":"#FFFFFF"},"config":{"position":['+left+','+top+'],"xtype":"TaskContainer"}}';

          }
          posJsonFormat[posJson] = 'task&'+taskId;
          posJson++;


          /**
           * Agregar elementos de tipo variable a la tarea actual
           *
           */
          var variables = nextEl.getElementsByTagName("variable");
          for(var i = 0; i< variables.length; i++) {
            var variable = variables[i];
            var varId    = (variable.attributes.getNamedItem("id") ?  variable.attributes.getNamedItem("id").nodeValue : '');

            var tokenlink    = (variable.attributes.getNamedItem("tokenlink") ?  variable.attributes.getNamedItem("tokenlink").nodeValue : '');
            var documentsource    = (variable.attributes.getNamedItem("documentsource") ?  variable.attributes.getNamedItem("documentsource").nodeValue : '');
            var rolfield    = (variable.attributes.getNamedItem("rolfield") ?  variable.attributes.getNamedItem("rolfield").nodeValue : '');
            var timestampfield    = (variable.attributes.getNamedItem("timestampfield") ?  variable.attributes.getNamedItem("timestampfield").nodeValue : '');
            var type    = (variable.attributes.getNamedItem("type") ?  variable.attributes.getNamedItem("type").nodeValue : '');
            var left = (variable.attributes.getNamedItem("left") ?  variable.attributes.getNamedItem("left").nodeValue : '');
            var top  = (variable.attributes.getNamedItem("top") ?  variable.attributes.getNamedItem("top").nodeValue : '');

            if(left=='' || top =='') {
              jsonModules += ',{"name":"Variable","value":{"id":"'+varId+'","tokenlink":"'+tokenlink+'","documentsource":"'+documentsource+'","rolfield":"'+rolfield+'","timestampfield":"'+timestampfield+'","type":"'+type+'","color":"#FFFFFF"},"config":{"position":['+(posX-30)+','+(posY-(i+1)*variableVar)+'],"xtype":"VariableContainer"}}';
            }
            else {
              jsonModules += ',{"name":"Variable","value":{"id":"'+varId+'","tokenlink":"'+tokenlink+'","documentsource":"'+documentsource+'","rolfield":"'+rolfield+'","timestampfield":"'+timestampfield+'","type":"'+type+'","color":"#FFFFFF"},"config":{"position":['+left+','+top+'],"xtype":"VariableContainer"}}';
            }
            posJsonFormat[posJson] = 'var&'+varId;
            posJson++;

            // Crea el Wire entre los dos elementos
            var srcPos = posJson -2;
            var tgtPos = posJson -1;
            jsonWires += ',{"xtype":"WireIt.BezierWire","src":{"moduleId":'+srcPos+',"terminal":"asociativo"},"tgt":{"moduleId":'+tgtPos+',"terminal":"asociativo"}}';
          }
          ////

        }

        // Crea el Wire entre los dos elementos
        var srcPos = this.findInIndex(id);
        var tgtPos = this.findInIndex('task&'+taskId);
        jsonWires += ',{"xtype":"WireIt.BezierArrowWire","src":{"moduleId":'+srcPos+',"terminal":"salida"},"tgt":{"moduleId":'+tgtPos+',"terminal":"entrada"}}';

        if(followit) this.followRoad('task&'+taskId, 0, xmlDoc);

        
      } else { 

        if(this.findInIndex('final') < 0) {
          var finalx = xmlDoc.documentElement.getElementsByTagName('condition');
          var fnl = finalx[1];
          var left        = (fnl.attributes.getNamedItem("left") ?  fnl.attributes.getNamedItem("left").nodeValue : '');
          var top         = (fnl.attributes.getNamedItem("top") ?  fnl.attributes.getNamedItem("top").nodeValue : '');
          // Calcula la posición en X y Y de el elemento a dibujar
          var posX = boxesWidth*posJson;

          if(left=='' || top =='') {
          jsonModules += ',{"name":"Condición Final","value":{},"config":{"position":['+posX+','+posY+'],"xtype":"WireIt.ImageContainer"}}';
          }
          else {
            jsonModules += ',{"name":"Condición Final","value":{},"config":{"position":['+left+','+top+'],"xtype":"WireIt.ImageContainer"}}';
          }
          posJsonFormat[posJson] = 'final';
          posJson++;
        }

        // Crea el Wire entre los dos elementos
        var srcPos = this.findInIndex(id);
        var tgtPos = this.findInIndex('final');
        jsonWires += ',{"xtype":"WireIt.BezierArrowWire","src":{"moduleId":'+srcPos+',"terminal":"salida"},"tgt":{"moduleId":'+tgtPos+',"terminal":"entrada"}}';
      }
    }
    
   /////////////////////////////////////////////////////////////////////////////

    /**
     * Procedimiento cuando el id es de un elemento tarea
     */
    var regexp = new RegExp('task&');
    if(id.search(regexp) > -1) {
      var idArr = id.split('&');
      var idEl  = idArr[1];   
    
      var task = this.getTaskInXmlById(idEl, xmlDoc);
      // si existe una condicion entra
      if(task != ''){

       /**
        * Conexiones de la tarea
        */
        var port = task.getElementsByTagName("port")[0];
        var connections = port.getElementsByTagName("connection");
        
        for(var j=0; j<connections.length;j++) {

          var connection = connections[j] || '';

          var connSrc    = (connection.attributes.getNamedItem("source") ?  connection.attributes.getNamedItem("source").nodeValue : '');
          var connOpt    = (connection.attributes.getNamedItem("options") ?  connection.attributes.getNamedItem("options").nodeValue : '');
          var connQuery  = (connection.attributes.getNamedItem("query") ?  connection.attributes.getNamedItem("query").nodeValue : '');
          var connTlink  = (connection.attributes.getNamedItem("tokenlink") ?  connection.attributes.getNamedItem("tokenlink").nodeValue : '');
          var left       = (connection.attributes.getNamedItem("left") ?  connection.attributes.getNamedItem("left").nodeValue : '');
          var top        = (connection.attributes.getNamedItem("top") ?  connection.attributes.getNamedItem("top").nodeValue : '');

          if(this.findInIndex('connection&'+idEl+'&'+j) < 0) {  // Si el elemento no ha sido insertado

            // Calcula la posición en X y Y de el elemento a dibujar
            var posX = boxesWidth*posJson;
                posYConn = posY-connecVar;
            
            /////
            if(left=='' || top =='') {
              jsonModules += ',{"name":"Conexión","value":{"options":"'+connOpt+'","query":"'+connQuery+'","tokenlink":"'+connTlink+'","color":"#FFFFFF"},"config":{"position":['+posX+','+posYConn+'],"xtype":"LinkContainer"}}';
            }
            else {
              jsonModules += ',{"name":"Conexión","value":{"options":"'+connOpt+'","query":"'+connQuery+'","tokenlink":"'+connTlink+'","color":"#FFFFFF"},"config":{"position":['+left+','+top+'],"xtype":"LinkContainer"}}';
            }
            posJsonFormat[posJson] = 'connection&'+idEl+'&'+j;
            posJson++;
          }

          // Crea el Wire entre los dos elementos
          var srcPos = this.findInIndex(id);
          var tgtPos = this.findInIndex('connection&'+idEl+'&'+j);
          jsonWires += ',{"xtype":"WireIt.BezierArrowWire","src":{"moduleId":'+srcPos+',"terminal":"salida"},"tgt":{"moduleId":'+tgtPos+',"terminal":"entrada"}}';

          this.followRoad('connection&'+idEl+'&'+j, 0, xmlDoc);
        }
      
      }
      
    }
 },


 /**
  * @method onNew
  */
  onNew: function() {

    FlowEditor.superclass.onNew.call(this);

    // Set the configuration for the initial layer
//    var events = {
//      modules:
//      [
//        {
//          name:"Condición Inicial",
//          value:{},
//          config:
//          {
//            position:[4,232],
//            xtype:"WireIt.ImageContainer"
//          }
//        },
//        {
//          name:"Condición Final",
//          value:{},
//          config:
//          {
//            position:[800,232],
//            xtype:"WireIt.ImageContainer"
//          }
//        },
//        {
//          name:"Conexión",
//          value:{},
//          config:
//          {
//            position:[95,226],
//            xtype:"WireIt.FormContainer"
//          }
//        }
//      ],
//
//      wires:
//      [
//        {
//          xtype:"WireIt.BezierArrowWire",
//          src:
//          {
//            moduleId: 0,
//            terminal: "salida"
//          },
//          tgt:
//          {
//            moduleId: 2,
//            terminal: "entrada"
//          }
//        }
//      ]
//    };
//    this.drawEvents(events);


  },

   /**
    * dibuja la condición inicial y final en el layer
    * @method drawEvents
    * @param {Object} wiring configuration
    */

   drawEvents: function(wiring) {

     if(YAHOO.lang.isArray(wiring.modules)) {

       // Containers
       for(i = 0 ; i < wiring.modules.length ; i++) {
          var m = wiring.modules[i];
          if(this.modulesByName[m.name]) {
             var baseContainerConfig = this.modulesByName[m.name].container;

             YAHOO.lang.augmentObject(m.config, baseContainerConfig);
             m.config.title = m.name;

             var container = this.layer.addContainer(m.config);
             YAHOO.util.Dom.addClass(container.el, "WiringEditor-module-"+m.name);
             container.setValue(m.value);
          }
          else {
             throw new Error("WiringEditor: module '"+m.name+"' not found !");
          }
       }

       // Wires
       if(YAHOO.lang.isArray(wiring.wires)) {
           for(i = 0 ; i < wiring.wires.length ; i++) {
              // On doit chercher dans la liste des terminaux de chacun des modules l'index des terminaux...
              this.layer.addWire(wiring.wires[i]);
           }
        }
      }
      this.markSaved();
    },


   addModule: function(module, pos){
     FlowEditor.superclass.addModule.call(this, module, pos);

     var value = this.getValue();
     // Make a copy of the object
     var wiring_all = {};
     YAHOO.lang.augmentObject(wiring_all, value);
     var wiring = wiring_all.working;


     if(module.name=="Tarea" && wiring.properties.auto_conn){
       var posconn = [];
       posconn[0] = pos[0]+250;
       posconn[1] = pos[1]+20;
       this.addModuleChild(this.modules[1], posconn);

       var posvar = [];
       posvar[0] = pos[0]-45;
       posvar[1] = pos[1]-70;
       this.addModuleChild(this.modules[2], posvar);

       var numElms = this.layer.containers.length;
       numTask = numElms-3;
       numConn = numElms-2;
       numVar = numElms-1;

       var wireVar  = {"xtype":"WireIt.BezierWire","src":{"moduleId":numTask,"terminal":"asociativo"},"tgt":{"moduleId":numVar,"terminal":"asociativo"}};
       var wireConn = {"xtype":"WireIt.BezierArrowWire","src":{"moduleId":numTask,"terminal":"salida"},"tgt":{"moduleId":numConn,"terminal":"entrada"}};

       this.layer.addWire(wireVar);
       this.layer.addWire(wireConn);
     }
   },

   addModuleChild: function(module, pos){
     FlowEditor.superclass.addModule.call(this, module, pos);
   }
});

(function() {

  var widget = YAHOO.widget, Event = YAHOO.util.Event, Dom = YAHOO.util.Dom;

  /**
   * Crea un campo  personalizado para seleccionar el color del elemento que lo contiene
   * @class CustomColorPickerField
   * @extends inputEx.ColorPickerField
   * @constructor
   * @param {Object} options Agrega opciones para el seleccionador de colores :
   * <ul>
   * 	<li>showcontrols: Muestra los valores de entrada RGB,HSV,RGB hex</li>
   * </ul>
   */
  CustomColorPickerField = function(options) {
    CustomColorPickerField.superclass.constructor.call(this,options);

    this.updatedEvt.subscribe(function(e,params) {
      var val = params[0];
      this.changeColor(val);
    });
  };
  YAHOO.lang.extend(CustomColorPickerField, inputEx.ColorPickerField, {
    setValue: function(value, sendUpdatedEvt){
      CustomColorPickerField.superclass.setValue.call(this, value, sendUpdatedEvt);
      var val = this.getValue();
      this.changeColor(val);
   },
   changeColor: function(color){
     var fieldSetDiv = this.divEl.parentNode;
     var fieldSetContDiv = fieldSetDiv.parentNode;
     var formDiv = fieldSetContDiv.parentNode;
     var handlerDiv = formDiv.parentNode;

     YAHOO.util.Dom.setStyle([formDiv,handlerDiv], 'background-color', color);
   }
  });

  inputEx.registerType("customcolorpicker", CustomColorPickerField, []);

})();
