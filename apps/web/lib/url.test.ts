import { describe, it, expect } from 'bun:test';
import { propertyDetailUrl, listingUrl } from './url';

describe('Frontend SEO Routing (TDD)', () => {
  describe('propertyDetailUrl', () => {
    it('should generate hierarchical detail url with city and district', () => {
      const url = propertyDetailUrl({
        city: 'Jakarta Selatan',
        district: 'Cipete',
        slug: 'rumah-mewah-3-kamar',
      });
      expect(url).toBe('/properti/jakarta-selatan-cipete/rumah-mewah-3-kamar');
    });

    it('should fall back to city only when district is empty', () => {
      const url = propertyDetailUrl({
        city: 'Surabaya',
        district: '',
        slug: 'tanah-kavling-murah',
      });
      expect(url).toBe('/properti/surabaya/tanah-kavling-murah');
    });
  });

  describe('listingUrl', () => {
    it('should generate 5-level SEO listing url', () => {
      const url = listingUrl({
        listingType: 'SALE',
        city: 'Jakarta Selatan',
        district: 'Kebayoran Baru',
        propertyType: 'HOUSE',
      });
      expect(url).toBe('/jual/jakarta-selatan/kebayoran-baru/rumah');
    });

    it('should generate city level listing url', () => {
      const url = listingUrl({
        listingType: 'RENT',
        city: 'Bandung',
      });
      expect(url).toBe('/sewa/bandung');
    });
  });
});
