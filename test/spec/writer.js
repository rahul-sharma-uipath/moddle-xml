import expect from '../expect.js';

import {
  Writer
} from 'moddle-xml';

import {
  createModelBuilder
} from '../helper.js';

import {
  assign
} from 'min-dash';


describe('Writer', function() {

  var createModel = createModelBuilder('test/fixtures/model/');

  function createWriter(model, options) {
    return new Writer(assign({ preamble: false }, options || {}));
  }


  describe('should export', function() {

    describe('base', function() {

      var model = createModel([ 'properties' ]);

      it('should write xml preamble', function() {

        // given
        var writer = new Writer({ preamble: true });
        var root = model.create('props:Root');

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<props:root xmlns:props="http://properties" />');
      });
    });


    describe('datatypes', function() {

      var datatypesModel = createModel([
        'datatype',
        'datatype-external',
        'datatype-aliased'
      ], {
        nsMap: {
          'http://www.omg.org/spec/XMI/20131001': 'xmi'
        }
      });


      it('via xsi:type', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root');

        root.set('bounds', datatypesModel.create('dt:Rect', { y: 100 }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<dt:root xmlns:dt="http://datatypes">' +
            '<dt:bounds y="100" />' +
          '</dt:root>');
      });


      it('via xmi:type', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root');

        root.set('xmiBounds', datatypesModel.create('dt:Rect', { y: 100 }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<dt:root xmlns:dt="http://datatypes">' +
            '<dt:xmiBounds y="100" />' +
          '</dt:root>');
      });


      it('via xsi:type / default / extension attributes', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root');

        root.set('bounds', datatypesModel.create('dt:Rect', {
          y: 100,
          'xmlns:f': 'http://foo',
          'f:bar': 'BAR'
        }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<dt:root xmlns:dt="http://datatypes">' +
            '<dt:bounds xmlns:f="http://foo" y="100" f:bar="BAR" />' +
          '</dt:root>');
      });


      it('via xsi:type / explicit / extension attributes', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root');

        root.set('bounds', datatypesModel.create('do:Rect', {
          x: 100,
          'xmlns:f': 'http://foo',
          'f:bar': 'BAR'
        }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<dt:root xmlns:dt="http://datatypes">' +
            '<dt:bounds xmlns:do="http://datatypes2" ' +
                       'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                       'xmlns:f="http://foo" xsi:type="do:Rect" ' +
                       'x="100" f:bar="BAR" />' +
          '</dt:root>'
        );
      });


      it('via xsi:type / explicit / local ns declaration', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root');

        root.set('bounds', datatypesModel.create('do:Rect', {
          x: 100,
          'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance'
        }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<dt:root xmlns:dt="http://datatypes">' +
            '<dt:bounds xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                       'xmlns:do="http://datatypes2" ' +
                       'xsi:type="do:Rect" ' +
                       'x="100" />' +
          '</dt:root>'
        );
      });


      it('via xsi:type / overriding existing <xsi:type> attr', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root', {
          'xmlns:foo': 'http://datatypes',
          'xmlns:bar': 'http://datatypes2'
        });

        root.set('bounds', datatypesModel.create('do:Rect', {
          x: 100,
          'xsi:type': 'other:Rect'
        }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<foo:root ' +
              'xmlns:foo="http://datatypes" ' +
              'xmlns:bar="http://datatypes2" ' +
              'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
            '<foo:bounds xsi:type="bar:Rect" x="100" />' +
          '</foo:root>'
        );
      });


      it('via xmi:type / implicit / extension attributes', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root');

        root.set('xmiBounds', datatypesModel.create('do:Rect', {
          x: 100,
          'xmlns:f': 'http://foo',
          'f:bar': 'BAR'
        }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<dt:root xmlns:dt="http://datatypes">' +
            '<dt:xmiBounds xmlns:do="http://datatypes2" ' +
                       'xmlns:xmi="http://www.omg.org/spec/XMI/20131001" ' +
                       'xmlns:f="http://foo" xmi:type="do:Rect" ' +
                       'x="100" f:bar="BAR" />' +
          '</dt:root>'
        );
      });


      it('via xsi:type / no namespace', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root', { ':xmlns': 'http://datatypes' });

        root.set('bounds', datatypesModel.create('dt:Rect', { y: 100 }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<root xmlns="http://datatypes">' +
            '<bounds y="100" />' +
          '</root>'
        );
      });


      it('via xsi:type / other namespace', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root', { 'xmlns:a' : 'http://datatypes' });

        root.set('bounds', datatypesModel.create('dt:Rect', { y: 100 }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<a:root xmlns:a="http://datatypes">' +
            '<a:bounds y="100" />' +
          '</a:root>'
        );
      });


      it('via xsi:type / in collection / other namespace)', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root');

        var otherBounds = root.get('otherBounds');

        otherBounds.push(datatypesModel.create('dt:Rect', { y: 200 }));
        otherBounds.push(datatypesModel.create('do:Rect', { x: 100 }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<dt:root xmlns:dt="http://datatypes" ' +
                   'xmlns:do="http://datatypes2" ' +
                   'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
            '<dt:otherBounds y="200" />' +
            '<dt:otherBounds xsi:type="do:Rect" x="100" />' +
          '</dt:root>'
        );
      });


      it('via xsi:type / in collection / type prefix', function() {

        // given
        var writer = createWriter(datatypesModel);

        var root = datatypesModel.create('dt:Root');

        var otherBounds = root.get('otherBounds');

        otherBounds.push(datatypesModel.create('da:Rect', { z: 200 }));
        otherBounds.push(datatypesModel.create('dt:Rect', { y: 100 }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<dt:root xmlns:dt="http://datatypes" ' +
                   'xmlns:da="http://datatypes-aliased" ' +
                   'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
            '<dt:otherBounds xsi:type="da:tRect" z="200" />' +
            '<dt:otherBounds y="100" />' +
          '</dt:root>'
        );
      });


      it('via xsi:type / body property', function() {

        var propertiesModel = createModel([ 'properties' ]);

        // given
        var writer = createWriter(propertiesModel);

        var body = propertiesModel.create('props:SimpleBody', {
          body: '${ foo < bar }'
        });
        var root = propertiesModel.create('props:WithBody', {
          someBody: body
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<props:withBody xmlns:props="http://properties" ' +
                          'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">' +
            '<props:someBody xsi:type="props:SimpleBody">' +
              '${ foo &lt; bar }' +
            '</props:someBody>' +
          '</props:withBody>'
        );
      });


      it('via xsi:type / body property / formated', function() {

        var propertiesModel = createModel([ 'properties' ]);

        // given
        var writer = createWriter(propertiesModel, { format: true });

        var body = propertiesModel.create('props:SimpleBody', { body: '${ foo < bar }' });
        var root = propertiesModel.create('props:WithBody', { someBody: body });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<props:withBody xmlns:props="http://properties" ' +
                          'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">\n' +
          '  <props:someBody xsi:type="props:SimpleBody">${ foo &lt; bar }</props:someBody>\n' +
          '</props:withBody>\n'
        );
      });


      it('keep empty tag', function() {

        // given
        var replaceModel = createModel([ 'replace' ]);

        var writer = createWriter(replaceModel);

        var simple = replaceModel.create('r:Extension', { value: '' });

        // when
        var xml = writer.toXML(simple);

        var expectedXml =
        '<r:Extension xmlns:r="http://replace">' +
          '<r:value></r:value>' +
        '</r:Extension>';

        // then
        expect(xml).to.eql(expectedXml);
      });

    });


    describe('attributes', function() {

      it('with line breaks', function() {

        // given
        var model = createModel([ 'properties' ]);

        var writer = createWriter(model);

        var root = model.create('props:BaseWithId', {
          id: 'FOO\nBAR'
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<props:baseWithId xmlns:props="http://properties" id="FOO&#10;BAR" />');
      });


      it('inherited', function() {

        // given
        var extendedModel = createModel([ 'properties', 'properties-extended' ]);

        var writer = createWriter(extendedModel);

        var root = extendedModel.create('ext:Root', {
          id: 'FOO'
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<ext:root xmlns:ext="http://extended" id="FOO" />');
      });


      it('extended', function() {

        // given
        var extendedModel = createModel([ 'extension/base', 'extension/custom' ]);

        var writer = createWriter(extendedModel);

        var root = extendedModel.create('b:SubRoot', {
          customAttr: 1,
          subAttr: 'FOO',
          ownAttr: 'OWN'
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<b:SubRoot xmlns:b="http://base" ' +
                     'xmlns:c="http://custom" ' +
                     'ownAttr="OWN" ' +
                     'c:customAttr="1" ' +
                     'subAttr="FOO" />'
        );
      });


      it('ignore undefined attribute values', function() {

        // given
        var model = createModel([ 'properties' ]);

        var writer = createWriter(model);

        var root = model.create('props:BaseWithId', {
          id: undefined
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<props:baseWithId xmlns:props="http://properties" />');
      });


      it('ignore null attribute values', function() {

        // given
        var model = createModel([ 'properties' ]);

        var writer = createWriter(model);

        var root = model.create('props:BaseWithId', {
          id: null
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<props:baseWithId xmlns:props="http://properties" />');
      });

    });


    describe('simple properties', function() {

      var model = createModel([ 'properties' ]);

      it('attribute', function() {

        // given
        var writer = createWriter(model);

        var attributes = model.create('props:Attributes', { integerValue: 1000 });

        // when
        var xml = writer.toXML(attributes);

        // then
        expect(xml).to.eql('<props:attributes xmlns:props="http://properties" integerValue="1000" />');
      });


      it('attribute, escaping special characters', function() {

        // given
        var writer = createWriter(model);

        var complex = model.create('props:Complex', { id: '<>\n&' });

        // when
        var xml = writer.toXML(complex);

        // then
        expect(xml).to.eql('<props:complex xmlns:props="http://properties" id="&#60;&#62;&#10;&#38;" />');
      });


      it('write integer property', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:SimpleBodyProperties', {
          intValue: 5
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:simpleBodyProperties xmlns:props="http://properties">' +
            '<props:intValue>5</props:intValue>' +
          '</props:simpleBodyProperties>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('write boolean property', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:SimpleBodyProperties', {
          boolValue: false
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:simpleBodyProperties xmlns:props="http://properties">' +
            '<props:boolValue>false</props:boolValue>' +
          '</props:simpleBodyProperties>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('write boolean property, formated', function() {

        // given
        var writer = createWriter(model, { format: true });

        var root = model.create('props:SimpleBodyProperties', {
          boolValue: false
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:simpleBodyProperties xmlns:props="http://properties">\n' +
          '  <props:boolValue>false</props:boolValue>\n' +
          '</props:simpleBodyProperties>\n';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('write string isMany property', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:SimpleBodyProperties', {
          str: [ 'A', 'B', 'C' ]
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:simpleBodyProperties xmlns:props="http://properties">' +
            '<props:str>A</props:str>' +
            '<props:str>B</props:str>' +
            '<props:str>C</props:str>' +
          '</props:simpleBodyProperties>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('write string isMany property, formated', function() {

        // given
        var writer = createWriter(model, { format: true });

        var root = model.create('props:SimpleBodyProperties', {
          str: [ 'A', 'B', 'C' ]
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:simpleBodyProperties xmlns:props="http://properties">\n' +
          '  <props:str>A</props:str>\n' +
          '  <props:str>B</props:str>\n' +
          '  <props:str>C</props:str>\n' +
          '</props:simpleBodyProperties>\n';

        // then
        expect(xml).to.eql(expectedXml);
      });

    });


    describe('embedded properties', function() {

      var model = createModel([ 'properties' ]);

      var extendedModel = createModel([ 'properties', 'properties-extended' ]);

      it('single', function() {

        // given
        var writer = createWriter(model);

        var complexCount = model.create('props:ComplexCount', { id: 'ComplexCount_1' });
        var embedding = model.create('props:Embedding', { embeddedComplex: complexCount });

        // when
        var xml = writer.toXML(embedding);

        var expectedXml =
          '<props:embedding xmlns:props="http://properties">' +
            '<props:complexCount id="ComplexCount_1" />' +
          '</props:embedding>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('property name', function() {

        // given
        var writer = createWriter(model);

        var propertyValue = model.create('props:BaseWithId', { id: 'PropertyValue' });
        var container = model.create('props:WithProperty', { propertyName: propertyValue });

        // when
        var xml = writer.toXML(container);

        var expectedXml =
          '<props:withProperty xmlns:props="http://properties">' +
            '<props:propertyName id="PropertyValue" />' +
          '</props:withProperty>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('collection', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:Root');

        var attributes = model.create('props:Attributes', { id: 'Attributes_1' });
        var simpleBody = model.create('props:SimpleBody');
        var containedCollection = model.create('props:ContainedCollection');

        var any = root.get('any');

        any.push(attributes);
        any.push(simpleBody);
        any.push(containedCollection);

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:root xmlns:props="http://properties">' +
            '<props:attributes id="Attributes_1" />' +
            '<props:simpleBody />' +
            '<props:containedCollection />' +
          '</props:root>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('collection / different ns', function() {

        // given
        var writer = createWriter(extendedModel);

        var root = extendedModel.create('ext:Root');

        var attributes1 = extendedModel.create('props:Attributes', { id: 'Attributes_1' });
        var attributes2 = extendedModel.create('props:Attributes', { id: 'Attributes_2' });
        var extendedComplex = extendedModel.create('ext:ExtendedComplex', { numCount: 100 });

        var any = root.get('any');

        any.push(attributes1);
        any.push(attributes2);
        any.push(extendedComplex);

        var elements = root.get('elements');
        elements.push(extendedModel.create('ext:Base'));

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<ext:root xmlns:ext="http://extended" xmlns:props="http://properties">' +
            '<props:attributes id="Attributes_1" />' +
            '<props:attributes id="Attributes_2" />' +
            '<ext:extendedComplex numCount="100" />' +
            '<ext:base />' +
          '</ext:root>';

        // then
        expect(xml).to.eql(expectedXml);
      });

    });


    describe('virtual properties', function() {

      var model = createModel([ 'virtual' ]);

      it('should not serialize virtual property', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('virt:Root', {
          child: model.create('virt:Child')
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<virt:Root xmlns:virt="http://virtual" />');
      });

    });


    describe('body text', function() {

      var model = createModel([ 'properties' ]);

      it('write body text property', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:SimpleBody', {
          body: 'textContent'
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<props:simpleBody xmlns:props="http://properties">textContent</props:simpleBody>');
      });


      it('write encode body property', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:SimpleBody', {
          body: '<h2>HTML&nbsp;"markup"</h2>'
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:simpleBody xmlns:props="http://properties">' +
            '&lt;h2&gt;HTML&amp;nbsp;"markup"&lt;/h2&gt;' +
          '</props:simpleBody>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('write encode body property in subsequent calls', function() {

        // given
        var writer = createWriter(model);

        var root1 = model.create('props:SimpleBody', {
          body: '<>'
        });
        var root2 = model.create('props:SimpleBody', {
          body: '<>'
        });

        // when
        var xml1 = writer.toXML(root1);
        var xml2 = writer.toXML(root2);

        var expectedXml =
          '<props:simpleBody xmlns:props="http://properties">' +
            '&lt;&gt;' +
          '</props:simpleBody>';

        // then
        expect(xml1).to.eql(expectedXml);
        expect(xml2).to.eql(expectedXml);
      });


      it('write encode body property with special chars', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:SimpleBody', {
          body: '&\n<>"\''
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:simpleBody xmlns:props="http://properties">' +
            '&amp;\n&lt;&gt;"\'' +
          '</props:simpleBody>';

        // then
        expect(xml).to.eql(expectedXml);
      });

    });


    describe('alias', function() {

      var model = createModel([ 'properties' ]);

      var noAliasModel = createModel([ 'noalias' ]);

      it('lowerCase', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:Root');

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<props:root xmlns:props="http://properties" />');
      });


      it('none', function() {

        // given
        var writer = createWriter(noAliasModel);

        var root = noAliasModel.create('na:Root');

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<na:Root xmlns:na="http://noalias" />');
      });
    });


    describe('ns', function() {

      var model = createModel([ 'properties' ]);
      var extendedModel = createModel([ 'properties', 'properties-extended' ]);

      it('single package', function() {

        // given
        var writer = createWriter(model);

        var root = model.create('props:Root');

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<props:root xmlns:props="http://properties" />');
      });


      it('multiple packages', function() {

        // given
        var writer = createWriter(extendedModel);

        var root = extendedModel.create('props:Root');

        root.get('any').push(extendedModel.create('ext:ExtendedComplex'));

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<props:root xmlns:props="http://properties" ' +
                      'xmlns:ext="http://extended">' +
            '<ext:extendedComplex />' +
          '</props:root>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('default ns', function() {

        // given
        var writer = createWriter(extendedModel);

        var root = extendedModel.create('props:Root', { ':xmlns': 'http://properties' });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<root xmlns="http://properties" />');
      });


      it('default ns / attributes', function() {

        // given
        var writer = createWriter(extendedModel);

        var root = extendedModel.create('props:Root', { ':xmlns': 'http://properties', id: 'Root' });

        var any = root.get('any');
        any.push(extendedModel.create('ext:ExtendedComplex'));
        any.push(extendedModel.create('props:Attributes', { id: 'Attributes_2' }));

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml)
          .to.eql('<root xmlns="http://properties" xmlns:ext="http://extended" id="Root">' +
                     '<ext:extendedComplex />' +
                     '<attributes id="Attributes_2" />' +
                   '</root>');
      });


      it('default ns / extension attributes', function() {

        // given
        var writer = createWriter(extendedModel);

        var root = extendedModel.create('props:Root', {
          ':xmlns': 'http://properties',
          'xmlns:foo': 'http://fooo',
          id: 'Root',
          'foo:bar': 'BAR'
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<root xmlns="http://properties" xmlns:foo="http://fooo" id="Root" foo:bar="BAR" />');
      });


      it('explicit ns / attributes', function() {

        // given
        var writer = createWriter(extendedModel);

        var root = extendedModel.create('props:Root', { 'xmlns:foo': 'http://properties', id: 'Root' });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<foo:root xmlns:foo="http://properties" id="Root" />');
      });

    });


    describe('reference', function() {

      var model = createModel([ 'properties' ]);

      it('single', function() {

        // given
        var writer = createWriter(model);

        var complex = model.create('props:Complex', { id: 'Complex_1' });
        var referencingSingle = model.create('props:ReferencingSingle', { referencedComplex: complex });

        // when
        var xml = writer.toXML(referencingSingle);

        // then
        expect(xml).to.eql('<props:referencingSingle xmlns:props="http://properties" referencedComplex="Complex_1" />');
      });


      it('collection', function() {

        // given
        var writer = createWriter(model);

        var complexCount = model.create('props:ComplexCount', { id: 'ComplexCount_1' });
        var complexNesting = model.create('props:ComplexNesting', { id: 'ComplexNesting_1' });

        var referencingCollection = model.create('props:ReferencingCollection', {
          references: [ complexCount, complexNesting ]
        });

        // when
        var xml = writer.toXML(referencingCollection);

        // then
        expect(xml).to.eql(
          '<props:referencingCollection xmlns:props="http://properties">' +
            '<props:references>ComplexCount_1</props:references>' +
            '<props:references>ComplexNesting_1</props:references>' +
          '</props:referencingCollection>');
      });


      it('attribute collection', function() {

        // given
        var writer = createWriter(model);

        var complexCount = model.create('props:ComplexCount', { id: 'ComplexCount_1' });
        var complexNesting = model.create('props:ComplexNesting', { id: 'ComplexNesting_1' });

        var attrReferenceCollection = model.create('props:AttributeReferenceCollection', {
          refs: [ complexCount, complexNesting ]
        });

        // when
        var xml = writer.toXML(attrReferenceCollection);

        // then
        expect(xml).to.eql('<props:attributeReferenceCollection xmlns:props="http://properties" refs="ComplexCount_1 ComplexNesting_1" />');
      });

    });


    it('redefined properties', function() {

      // given
      var model = createModel([ 'redefine' ]);

      var writer = createWriter(model);

      var element = model.create('r:Extension', {
        id: 1,
        name: 'FOO',
        value: 'BAR'
      });

      var expectedXml = '<r:Extension xmlns:r="http://redefine">' +
                          '<r:id>1</r:id>' +
                          '<r:name>FOO</r:name>' +
                          '<r:value>BAR</r:value>' +
                        '</r:Extension>';

      // when
      var xml = writer.toXML(element);

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('replaced properties', function() {

      // given
      var model = createModel([ 'replace' ]);

      var writer = createWriter(model);

      var element = model.create('r:Extension', {
        id: 1,
        name: 'FOO',
        value: 'BAR'
      });

      var expectedXml = '<r:Extension xmlns:r="http://replace">' +
                          '<r:name>FOO</r:name>' +
                          '<r:value>BAR</r:value>' +
                          '<r:id>1</r:id>' +
                        '</r:Extension>';

      // when
      var xml = writer.toXML(element);

      // then
      expect(xml).to.eql(expectedXml);
    });

    it('missing $descriptor', function() {

      // given
      var model = createModel([ 'properties' ]);

      var writer = new Writer({ preamble: true });
      var root = model.create('props:Root');

      root.get('any').push(model.create('props:Attributes'));

      // force set $descriptor property for test purposes
      Object.defineProperty(root.any[0], '$descriptor', {
        value: undefined,
        writable: true,
        configurable: true,
        enumerable: true
      });

      // when
      var xml = writer.toXML(root);

      // then
      expect(xml).to.eql(
        '<?xml version="1.0" encoding="UTF-8"?>\n' +
          '<props:root xmlns:props="http://properties" />');
    });
  });


  describe('extension handling', function() {

    var extensionModel = createModel([ 'extensions' ]);


    describe('attributes', function() {

      it('should write xsi:schemaLocation', function() {

        // given
        var writer = createWriter(extensionModel);

        var root = extensionModel.create('e:Root', {
          'xsi:schemaLocation': 'http://fooo ./foo.xsd'
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<e:root xmlns:e="http://extensions" ' +
                  'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ' +
                  'xsi:schemaLocation="http://fooo ./foo.xsd" />';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('should write extension attributes', function() {

        // given
        var writer = createWriter(extensionModel);

        var root = extensionModel.create('e:Root', {
          'xmlns:foo': 'http://fooo',
          'foo:bar': 'BAR'
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql('<e:root xmlns:e="http://extensions" xmlns:foo="http://fooo" foo:bar="BAR" />');
      });

    });


    describe('elements', function() {

      it('should write self-closing extension elements', function() {

        // given
        var writer = createWriter(extensionModel);

        var meta1 = extensionModel.createAny('other:meta', 'http://other', {
          key: 'FOO',
          value: 'BAR'
        });

        var meta2 = extensionModel.createAny('other:meta', 'http://other', {
          key: 'BAZ',
          value: 'FOOBAR'
        });

        var root = extensionModel.create('e:Root', {
          id: 'FOO',
          extensions: [ meta1, meta2 ]
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<e:root xmlns:e="http://extensions" xmlns:other="http://other">' +
            '<e:id>FOO</e:id>' +
            '<other:meta key="FOO" value="BAR" />' +
            '<other:meta key="BAZ" value="FOOBAR" />' +
          '</e:root>');
      });


      // #23
      it('should write unqualified element', function() {

        // given
        var writer = createWriter(extensionModel);

        // explicitly create element with elementForm=unqualified
        var root = extensionModel.createAny('root', undefined, {
          key: 'FOO',
          value: 'BAR'
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<root key="FOO" value="BAR" />'
        );
      });


      it('should write extension element body', function() {

        // given
        var writer = createWriter(extensionModel);

        var note = extensionModel.createAny('other:note', 'http://other', {
          $body: 'a note'
        });

        var root = extensionModel.create('e:Root', {
          id: 'FOO',
          extensions: [ note ]
        });

        // when
        var xml = writer.toXML(root);

        // then
        expect(xml).to.eql(
          '<e:root xmlns:e="http://extensions" xmlns:other="http://other">' +
            '<e:id>FOO</e:id>' +
            '<other:note>' +
              'a note' +
            '</other:note>' +
          '</e:root>');
      });


      it('should write nested extension element', function() {

        // given
        var writer = createWriter(extensionModel);

        var meta1 = extensionModel.createAny('other:meta', 'http://other', {
          key: 'k1',
          value: 'v1'
        });

        var meta2 = extensionModel.createAny('other:meta', 'http://other', {
          key: 'k2',
          value: 'v2'
        });

        var additionalNote = extensionModel.createAny('other:additionalNote', 'http://other', {
          $body: 'this is some text'
        });

        var nestedMeta = extensionModel.createAny('other:nestedMeta', 'http://other', {
          $children: [ meta1, meta2, additionalNote ]
        });

        var root = extensionModel.create('e:Root', {
          id: 'FOO',
          extensions: [ nestedMeta ]
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<e:root xmlns:e="http://extensions" xmlns:other="http://other">' +
            '<e:id>FOO</e:id>' +
            '<other:nestedMeta>' +
              '<other:meta key="k1" value="v1" />' +
              '<other:meta key="k2" value="v2" />' +
              '<other:additionalNote>' +
                'this is some text' +
              '</other:additionalNote>' +
            '</other:nestedMeta>' +
          '</e:root>';

        // then
        expect(xml).to.eql(expectedXml);
      });
    });

  });


  describe('qualified extensions', function() {

    var extensionModel = createModel([ 'extension/base', 'extension/custom' ]);


    it('should write typed extension property', function() {

      // given
      var writer = createWriter(extensionModel);

      var customGeneric = extensionModel.create('c:CustomGeneric', { count: 10 });

      var root = extensionModel.create('b:Root', {
        generic: customGeneric
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<b:Root xmlns:b="http://base" xmlns:c="http://custom">' +
          '<c:CustomGeneric count="10" />' +
        '</b:Root>';

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('should write typed extension attribute', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('b:Root', { customAttr: 666 });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<b:Root xmlns:b="http://base" xmlns:c="http://custom" c:customAttr="666" />';

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('should write generic collection', function() {

      // given
      var writer = createWriter(extensionModel);

      var property1 = extensionModel.create('c:Property', { key: 'foo', value: 'FOO' });
      var property2 = extensionModel.create('c:Property', { key: 'bar', value: 'BAR' });

      var any = extensionModel.createAny('other:Xyz', 'http://other', {
        $body: 'content'
      });

      var root = extensionModel.create('b:Root', {
        genericCollection: [ property1, property2, any ]
      });

      var xml = writer.toXML(root);

      var expectedXml =
        '<b:Root xmlns:b="http://base" xmlns:c="http://custom" ' +
                'xmlns:other="http://other">' +
          '<c:Property key="foo" value="FOO" />' +
          '<c:Property key="bar" value="BAR" />' +
          '<other:Xyz>content</other:Xyz>' +
        '</b:Root>';

      // then
      expect(xml).to.eql(expectedXml);

    });

  });


  describe('namespace declarations', function() {

    var extensionModel = createModel([ 'extensions' ]);

    var extendedModel = createModel([
      'properties',
      'properties-extended'
    ]);


    describe('should deconflict namespace prefixes', function() {

      it('on nested Any', function() {

        // given
        var writer = createWriter(extensionModel);

        var root = extensionModel.create('e:Root', {
          extensions: [
            extensionModel.createAny('e:foo', 'http://not-extensions', {
              foo: 'BAR'
            })
          ]
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<e:root xmlns:e="http://extensions" ' +
                    'xmlns:e_1="http://not-extensions">' +
            '<e_1:foo foo="BAR" />' +
          '</e:root>';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('on explicitly added namespace', function() {

        // given
        var writer = createWriter(extensionModel);

        var root = extensionModel.create('e:Root', {
          'xmlns:e': 'http://not-extensions'
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<e_1:root xmlns:e_1="http://extensions" ' +
                    'xmlns:e="http://not-extensions" />';

        // then
        expect(xml).to.eql(expectedXml);
      });


      it('on explicitly added namespace + Any', function() {

        // given
        var writer = createWriter(extensionModel);

        var root = extensionModel.create('e:Root', {
          'xmlns:e': 'http://not-extensions',
          extensions: [
            extensionModel.createAny('e:foo', 'http://not-extensions', {
              foo: 'BAR'
            })
          ]
        });

        // when
        var xml = writer.toXML(root);

        var expectedXml =
          '<e_1:root xmlns:e_1="http://extensions" ' +
                    'xmlns:e="http://not-extensions">' +
            '<e:foo foo="BAR" />' +
          '</e_1:root>';

        // then
        expect(xml).to.eql(expectedXml);
      });

    });


    it('should write manually added custom namespace', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('e:Root', {
        'xmlns:foo': 'http://fooo'
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<e:root xmlns:e="http://extensions" ' +
                'xmlns:foo="http://fooo" />';

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('should ignore unknown namespace prefix', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('e:Root', {
        'foo:bar': 'BAR'
      });

      // when
      var xml = writer.toXML(root);

      // then
      expect(xml).to.eql('<e:root xmlns:e="http://extensions" />');
    });


    it('should write custom', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('e:Root', {

        // unprefixed root namespace
        ':xmlns': 'http://extensions',
        extensions: [
          extensionModel.createAny('bar:bar', 'http://bar', {
            'xmlns:bar': 'http://bar',
            $children: [
              extensionModel.createAny('other:child', 'http://other', {
                'xmlns:other': 'http://other',
                b: 'B'
              })
            ]
          }),
          extensionModel.createAny('ns0:foo', 'http://foo', {

            // unprefixed extension namespace
            'xmlns': 'http://foo',
            $children: [
              extensionModel.createAny('ns0:child', 'http://foo', {
                a: 'A'
              })
            ]
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<root xmlns="http://extensions">' +
          '<bar:bar xmlns:bar="http://bar">' +
            '<other:child xmlns:other="http://other" b="B" />' +
          '</bar:bar>' +
          '<foo xmlns="http://foo">' +
            '<child a="A" />' +
          '</foo>' +
        '</root>';

      // then
      expect(xml).to.eql(expectedXml);

    });


    it('should write nested custom', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('e:Root', {

        // unprefixed root namespace
        ':xmlns': 'http://extensions',
        extensions: [
          extensionModel.createAny('bar:bar', 'http://bar', {
            'xmlns:bar': 'http://bar',
            'bar:attr': 'ATTR'
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<root xmlns="http://extensions">' +
          '<bar:bar xmlns:bar="http://bar" attr="ATTR" />' +
        '</root>';

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('should strip redundant nested custom', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('e:Root', {

        // unprefixed root namespace
        ':xmlns': 'http://extensions',
        'xmlns:bar': 'http://bar',
        extensions: [
          extensionModel.createAny('bar:bar', 'http://bar', {
            'xmlns:bar': 'http://bar',
            'bar:attr': 'ATTR'
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<root xmlns="http://extensions" xmlns:bar="http://bar">' +
          '<bar:bar attr="ATTR" />' +
        '</root>';

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('should strip different prefix nested custom', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('e:Root', {

        // unprefixed root namespace
        ':xmlns': 'http://extensions',
        'xmlns:otherBar': 'http://bar',
        'xmlns:otherFoo': 'http://foo',
        extensions: [
          extensionModel.createAny('bar:bar', 'http://bar', {
            'xmlns:bar': 'http://bar',
            'xmlns:foo': 'http://foo',
            'bar:attr': 'ATTR',
            'foo:attr': 'FOO_ATTR'
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<root xmlns="http://extensions" xmlns:otherBar="http://bar" ' +
              'xmlns:otherFoo="http://foo">' +
          '<otherBar:bar attr="ATTR" otherFoo:attr="FOO_ATTR" />' +
        '</root>';

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('should write normalized custom', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('e:Root', {

        // unprefixed root namespace
        ':xmlns': 'http://extensions',
        'xmlns:otherBar': 'http://bar',
        extensions: [
          extensionModel.createAny('bar:bar', 'http://bar', {
            'bar:attr': 'ATTR'
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<root xmlns="http://extensions" xmlns:otherBar="http://bar">' +
          '<otherBar:bar attr="ATTR" />' +
        '</root>';

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('should write wellknown', function() {

      // given
      var writer = createWriter(extendedModel);

      var root = extendedModel.create('props:Root', {

        // unprefixed top-level namespace
        ':xmlns': 'http://properties',
        any: [
          extendedModel.create('ext:ExtendedComplex', {

            // unprefixed nested namespace
            ':xmlns': 'http://extended'
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<root xmlns="http://properties">' +
          '<extendedComplex xmlns="http://extended" />' +
        '</root>';

      // then
      expect(xml).to.eql(expectedXml);
    });


    it('should write only actually exposed', function() {

      // given
      var writer = createWriter(extendedModel);

      var root = extendedModel.create('ext:Root', {

        // unprefixed top-level namespace
        ':xmlns': 'http://extended',
        id: 'ROOT',
        any: [
          extendedModel.create('props:Complex', {

            // unprefixed nested namespace
            ':xmlns': 'http://properties'
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      var expectedXml =
        '<root xmlns="http://extended" id="ROOT">' +
          '<complex xmlns="http://properties" />' +
        '</root>';

      // then
      expect(xml).to.eql(expectedXml);

    });


    it('should write xsi:type namespaces', function() {

      var model = createModel([
        'datatype',
        'datatype-external',
        'datatype-aliased'
      ]);

      // given
      var writer = createWriter(model);

      var root = model.create('da:Root', {
        'xmlns:a' : 'http://datatypes-aliased',
        otherBounds: [
          model.create('dt:Rect', {
            ':xmlns': 'http://datatypes',
            y: 100
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      // then
      expect(xml).to.eql(
        '<a:Root xmlns:a="http://datatypes-aliased">' +
          '<otherBounds xmlns="http://datatypes" y="100" />' +
        '</a:Root>');

    });


    it('should strip unused global', function() {

      // given
      var writer = createWriter(extendedModel);

      var root = extendedModel.create('ext:Root', {
        ':xmlns': 'http://extended',
        id: 'Root',
        'xmlns:props': 'http://properties',
        any: [
          extendedModel.create('props:Base', { ':xmlns': 'http://properties' })
        ]
      });

      // when
      var xml = writer.toXML(root);

      // then
      expect(xml).to.eql(
        '<root xmlns="http://extended" id="Root">' +
          '<base xmlns="http://properties" />' +
        '</root>'
      );
    });


    it('should strip xml namespace', function() {

      // given
      var writer = createWriter(extensionModel);

      var root = extensionModel.create('e:Root', {
        'xml:lang': 'de',
        extensions: [
          extensionModel.createAny('bar:bar', 'http://bar', {
            'xml:lang': 'en'
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      // then
      expect(xml).to.eql(
        '<e:root xmlns:e="http://extensions" xmlns:bar="http://bar" xml:lang="de">' +
          '<bar:bar xml:lang="en" />' +
        '</e:root>'
      );
    });


    it('should keep local override', function() {

      // given
      var writer = createWriter(extendedModel);

      var root = extendedModel.create('props:ComplexNesting', {
        'xmlns:root': 'http://properties',
        id: 'ComplexNesting',
        nested: [
          extendedModel.create('props:ComplexNesting', {
            ':xmlns': 'http://properties',
            nested: [
              extendedModel.create('props:ComplexNesting', {
                nested: [
                  extendedModel.create('props:ComplexNesting', {
                    'xmlns:foo': 'http://properties'
                  })
                ]
              })
            ]
          })
        ]
      });

      // when
      var xml = writer.toXML(root);

      // then
      expect(xml).to.eql(
        '<root:complexNesting xmlns:root="http://properties" id="ComplexNesting">' +
          '<complexNesting xmlns="http://properties">' +
            '<complexNesting>' +
              '<foo:complexNesting xmlns:foo="http://properties" />' +
            '</complexNesting>' +
          '</complexNesting>' +
        '</root:complexNesting>'
      );
    });

  });


  it('should reuse global namespace', function() {

    var model = createModel([
      'properties',
      'properties-extended'
    ]);

    // given
    var writer = createWriter(model);

    // <props:Root xmlns:props="http://properties" xmlns:ext="http://extended">
    //   <complexNesting... xmlns="http://props">
    //     <ext:extendedComplex numCount="1" />
    //   </complexNesting>
    // </props:Root>
    var root = model.create('props:Root', {
      'xmlns:props': 'http://properties',
      'xmlns:ext': 'http://extended',
      any: [
        model.create('props:ComplexNesting', {
          ':xmlns': 'http://properties',
          nested: [
            model.create('ext:ExtendedComplex', { numCount: 1 })
          ]
        })
      ]
    });

    // when
    var xml = writer.toXML(root);

    var expectedXML =
      '<props:root xmlns:props="http://properties" xmlns:ext="http://extended">' +
        '<complexNesting xmlns="http://properties">' +
          '<ext:extendedComplex numCount="1" />' +
        '</complexNesting>' +
      '</props:root>';

    // then
    expect(xml).to.eql(expectedXML);

  });


  describe('custom namespace mapping', function() {

    var datatypesModel = createModel([
      'datatype',
      'datatype-external'
    ], {
      nsMap: {
        'http://www.omg.org/spec/XMI/20131001': 'xmi'
      }
    });


    it('should write explicitly remapped xsi:type', function() {

      // given
      var writer = createWriter(datatypesModel);

      var root = datatypesModel.create('dt:Root');

      root.set('bounds', datatypesModel.create('do:Rect', {
        x: 100,
        'xmlns:foo': 'http://www.w3.org/2001/XMLSchema-instance'
      }));

      // when
      var xml = writer.toXML(root);

      // then
      expect(xml).to.eql(
        '<dt:root xmlns:dt="http://datatypes">' +
          '<dt:bounds xmlns:do="http://datatypes2" ' +
                     'xmlns:foo="http://www.w3.org/2001/XMLSchema-instance" ' +
                     'foo:type="do:Rect" ' +
                     'x="100" />' +
        '</dt:root>'
      );
    });


    it('should write explicitly remapped xmi:type', function() {

      // given
      var writer = createWriter(datatypesModel);

      var root = datatypesModel.create('dt:Root');

      root.set('xmiBounds', datatypesModel.create('do:Rect', {
        x: 100,
        'xmlns:foo': 'http://www.omg.org/spec/XMI/20131001'
      }));

      // when
      var xml = writer.toXML(root);

      // then
      expect(xml).to.eql(
        '<dt:root xmlns:dt="http://datatypes">' +
          '<dt:xmiBounds xmlns:do="http://datatypes2" ' +
                     'xmlns:foo="http://www.omg.org/spec/XMI/20131001" ' +
                     'foo:type="do:Rect" ' +
                     'x="100" />' +
        '</dt:root>'
      );
    });

  });

});
