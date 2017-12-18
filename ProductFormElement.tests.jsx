/* eslint-env mocha */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Factory } from 'meteor/factory';
import { shallow } from 'enzyme';
import { expect } from 'chai';
import Loading from '../common/loading/Loading.jsx';
import '../../../../utils/factories.js';
import { stubUser, restoreUser } from '../../../../utils/test-helpers.js';
import ProductFormElement from './ProductFormElement.jsx';
import AdminPageContainer from '../common/admin-layout/AdminPageContainer.jsx';
import FormVendorInformation from '../form/FormVendorInformation.jsx';
import FormCategorySelect from '../form/FormCategorySelect.jsx';

describe('ProductFormElement', () => {
  if (Meteor.isServer) {
    return;
  }
  let product;
  let wrapper;
  before(() => {
    stubUser();
    product = Factory.build('product');
  });
  after(() => {
    restoreUser();
  });
  describe('when its loading', () => {
    before(() => {
      wrapper = shallow(
        <ProductFormElement
          loading
          product={product}
        />
      );
    });
    it('should show loading element', () => {
      expect(wrapper.find(Loading).exists()).to.be.true;
    });
    it('should not show loading element', () => {
      expect(wrapper.find(AdminPageContainer).exists()).to.be.false;
    });
  });
  describe('when its not loading', () => {
    describe('when adding a new product', () => {
      before(() => {
        wrapper = shallow(
          <ProductFormElement
            product={{
              imageUrls: [],
            }}
          />
        );
      });
      it('should show form', () => {
        expect(wrapper.find('form#product-form').exists()).to.be.true;
      });
      it('should have featured option as No', () => {
        expect(wrapper.find('#product-featured-no').props().defaultChecked).to.be.true;
      });
      it('should have empty listings information', () => {
        expect(
          wrapper
            .find(FormVendorInformation)
            .props()
            .listingInformation
        ).to.deep.equal({});
      });
      it('should have empty category ids', () => {
        expect(
          wrapper
            .find(FormCategorySelect)
            .props()
            .selectedCategories
        ).to.be.undefined;
      });
    });
    describe('when editing product', () => {
      before(() => {
        wrapper = shallow(
          <ProductFormElement
            product={product}
          />
        );
      });
      it('should have id', () => {
        expect(
          wrapper.find('#product-id').props()
            .defaultValue
        ).to
          .equal(product._id);
      });
      it('should have name', () => {
        const props = wrapper.find('#product-name').props();
        expect(props.data).to.deep.equal(product);
      });
      it('should have description', () => {
        const props = wrapper.find('#product-description').props();
        expect(props.data).to.deep.equal(product);
        expect(props.type).to.equal('textarea');
      });
      it('should have specifications', () => {
        const props = wrapper.find('#product-specifications').props();
        expect(props.data).to.deep.equal(product);
        expect(props.type).to.equal('textarea');
      });
      it('should have additionalInformation', () => {
        const props = wrapper.find('#product-additionalInformation').props();
        expect(props.data).to.deep.equal(product);
        expect(props.type).to.equal('textarea');
      });
      it('should have sku', () => {
        const props = wrapper.find('#product-sku').props();
        expect(props.data).to.deep.equal(product);
      });
      it('should have brand', () => {
        const props = wrapper.find('#product-brand').props();
        expect(props.data).to.deep.equal(product);
      });
      it('should have featured', () => {
        expect(
          wrapper.find(`Radio[defaultValue="${product.featured}"]`)
            .props()
            .defaultChecked
        ).to.be.true;
      });
      it('should have cateogryIds', () => {
        expect(
          wrapper
            .find(FormCategorySelect)
            .props()
            .selectedCategories
        ).to.deep.equal(product.categoryIds);
      });
      it('should have listing information', () => {
        expect(
          wrapper
            .find(FormVendorInformation)
            .props()
            .listingInformation
        ).to.deep.equal(product.listings[0]);
      });
    });
  });
});
