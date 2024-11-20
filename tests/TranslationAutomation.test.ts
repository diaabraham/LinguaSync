import { TranslationAutomation } from '../src/services/TranslationAutomation';
import { expect } from 'chai';
import sinon from 'sinon';

describe('TranslationAutomation', () => {
  let automation: TranslationAutomation;

  beforeEach(() => {
    automation = new TranslationAutomation('fake-api-key');
  });

  describe('replaceLinks', () => {
    it('should replace links correctly', () => {
      automation['linkMappings'] = [
        { englishPattern: 'example.com', quebecFrenchReplacement: 'exemple.qc.ca', domain: 'example' },
      ];

      const input = '<a href="https://www.example.com/page">Link</a>';
      const expected = '<a href="https://www.exemple.qc.ca/page">Link</a>';

      expect(automation['replaceLinks'](input)).to.equal(expected);
    });

    it('should preserve casing', () => {
      automation['linkMappings'] = [
        { englishPattern: 'example', quebecFrenchReplacement: 'exemple', domain: 'example' },
      ];

      const input = '<a href="EXAMPLE.com">EXAMPLE</a>';
      const expected = '<a href="EXEMPLE.com">EXAMPLE</a>';

      expect(automation['replaceLinks'](input)).to.equal(expected);
    });
  });

  describe('replaceImages', () => {
    it('should replace image sources correctly', () => {
      automation['imageMappings'] = [
        { originalPattern: 'image.jpg', localizedReplacement: 'image-fr.jpg', metadata: {} },
      ];

      const input = '<img src="/path/to/image.jpg" alt="Image">';
      const expected = '<img src="/path/to/image-fr.jpg" alt="Image">';

      expect(automation['replaceImages'](input)).to.equal(expected);
    });

    it('should handle full URLs in replacements', () => {
      automation['imageMappings'] = [
        { originalPattern: 'image.jpg', localizedReplacement: 'https://cdn.example.com/image-fr.jpg', metadata: {} },
      ];

      const input = '<img src="/path/to/image.jpg" alt="Image">';
      const expected = '<img src="https://cdn.example.com/image-fr.jpg" alt="Image">';

      expect(automation['replaceImages'](input)).to.equal(expected);
    });
  });

  describe('processPage', () => {
    it('should process a page correctly', async () => {
      const fakeHubspotClient = {
        cms: {
          pages: {
            basicApi: {
              getById: sinon.stub().resolves({ content: '<a href="example.com">Link</a>' }),
              update: sinon.stub().resolves(),
            },
          },
        },
      };

      automation['hubspotClient'] = fakeHubspotClient as any;
      automation['linkMappings'] = [
        { englishPattern: 'example.com', quebecFrenchReplacement: 'exemple.qc.ca', domain: 'example' },
      ];

      await automation.processPage('fake-page-id');

      expect(fakeHubspotClient.cms.pages.basicApi.getById.calledOnce).to.be.true;
      expect(fakeHubspotClient.cms.pages.basicApi.update.calledOnce).to.be.true;
      expect(fakeHubspotClient.cms.pages.basicApi.update.firstCall.args[1].content).to.equal('<a href="exemple.qc.ca">Link</a>');
    });
  });
});