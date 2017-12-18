import React, { Component } from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { RavenLogger } from 'meteor/dvelopment:raven';
import numeral from 'numeral';
import { Random } from 'meteor/random';
import { displayError } from '/imports/ui/lib/notify.js';
import { $ } from 'meteor/jquery';
import { Row, Radio, Button, FormGroup, ControlLabel, Col } from 'react-bootstrap';
import { _T } from '../../../lib/i18n.js';
import PropTypes from 'prop-types';
import { saveProduct } from '/imports/api/products/methods.js';
import Loading from '../common/loading/Loading.jsx';
import ImagePreview from '../image-preview/ImagePreview.jsx';
import AdminPageContainer from '../common/admin-layout/AdminPageContainer.jsx';
import AdminPageContent from '../common/admin-layout/AdminPageContent.jsx';
import AdminNavButtons from '../common/admin-layout/AdminNavButtons.jsx';
import FormTextInput from '../form/FormTextInput.jsx';
import FormSection from '../form/FormSection.jsx';
import FormCategorySelect from '../form/FormCategorySelect.jsx';
import FormVendorInformation from '../form/FormVendorInformation.jsx';
import ProductImageUploader from '../product-image-uploader/ProductImageUploader.jsx';

class ProductFormElement extends Component {
  constructor(props) {
    super(props);

    this.state = {
      product: props.product,
    };

    this.pageTitle = this.pageTitle.bind(this);
    this.listingInformation = this.listingInformation.bind(this);
    this.addProductImage = this.addProductImage.bind(this);
    this.addFeaturedImage = this.addFeaturedImage.bind(this);
  }

  componentDidMount() {
    if (!this.props.loading) {
      $('#product-form').parsley().on('form:validate', (formInstance) => {
        const ok = (this.state.product.imageUrls.length > 0);
        if (!ok) {
          $('.invalid-imageurls-error-message').show();
          // eslint-disable-next-line
          formInstance.validationResult = false;
        } else {
          $('.invalid-imageurls-error-message').hide();
        }
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      product: nextProps.product,
    });
  }

  showFeaturedImagePreview() {
    return (this.state.product.featureImage &&
    this.state.product.featureImage !== '') ? <ImagePreview
      url={this.state.product.featureImage}
      previewSize={9}
      removeImage={() => {
        this.removeFeaturedImage();
      }}
    /> : null;
  }

  processProductForm() {
    if ($('#product-form').parsley().validate()) {
      const productData = $('#product-form').serializeObject();
      const productListingArray = [];

      productData.product.listings.forEach((d) => {
        const data = d;
        data.original_price = numeral(d.original_price).value();
        if (data.price !== '') {
          data.price = numeral(d.price).value();
        }
        productListingArray.push(data);
      });
      productData.product.listings = productListingArray;
      saveProduct.call(productData, (error) => {
        if (error) {
          RavenLogger.log('Error Saving Product', {
            extra: {
              productData,
            },
          });
          displayError(error);
        } else {
          FlowRouter.go('admin.products.list');
        }
      });
    }
  }

  pageTitle() {
    return (
    FlowRouter.getRouteName() === 'admin.products.edit' ?
      `Edit Product: ${this.state.product.name}` :
      _T('admin.products.form.title.basic_information')
    );
  }

  listingInformation() {
    if (this.state.product.listings && this.state.product.listings[0]) {
      return this.state.product.listings[0];
    }
    return {};
  }

  addProductImage(url) {
    const newProduct = this.state.product;
    if (newProduct.imageUrls) {
      newProduct.imageUrls.push(url);
    } else {
      newProduct.imageUrls = [url];
    }
    this.setState({
      product: newProduct,
    });
  }

  removeProductImage(index) {
    const newProduct = this.state.product;
    newProduct.imageUrls.splice(index, 1);
    this.setState({
      product: newProduct,
    });
  }

  addFeaturedImage(url) {
    const newProduct = this.state.product;
    newProduct.featureImage = url;
    this.setState({
      product: newProduct,
    });
  }

  removeFeaturedImage() {
    const newProduct = this.state.product;
    newProduct.featureImage = '';
    this.setState({
      product: newProduct,
    });
  }

  render() {
    return (
    this.props.loading ?
      <Loading /> :
      <AdminPageContainer title={this.pageTitle()}>
        <AdminNavButtons
          currentPage="admin.products.add"
          buttonType="products"
        />
        <AdminPageContent>
          <form
            id="product-form"
            role="form"
          >
            <input
              type="hidden"
              id="product-id"
              name="_id"
              defaultValue={this.state.product._id}
              readOnly
            />
            <FormSection
              title={_T('admin.products.form.title.basic_information')}
            >
              <section>
                <FormTextInput
                  id="product-name"
                  name="name"
                  typeData="product"
                  data={this.state.product}
                />
                <FormTextInput
                  id="product-description"
                  name="description"
                  type="textarea"
                  typeData="product"
                  data={this.state.product}
                />
                <FormTextInput
                  id="product-specifications"
                  name="specifications"
                  type="textarea"
                  typeData="product"
                  data={this.state.product}
                />
                <FormTextInput
                  id="product-additionalInformation"
                  name="additionalInformation"
                  type="textarea"
                  required={false}
                  typeData="product"
                  data={this.state.product}
                />
                <FormTextInput
                  id="product-sku"
                  name="sku"
                  typeData="product"
                  data={this.state.product}
                />
                <FormGroup controlId="product-featured">
                  <Row>
                    <ControlLabel bsClass="col-lg-2 control-label">
                      {_T('admin.products.form.featured.label')}
                    </ControlLabel>
                    <Col lg={10}>
                      <Radio
                        name="product[featured]"
                        defaultValue="Yes"
                        defaultChecked={this.state.product.featured === 'Yes'}
                      >
                        Featured Product Slide
                      </Radio>
                      <Radio
                        name="product[featured]"
                        defaultValue="Hero_Slider"
                        defaultChecked={this.state.product.featured === 'Hero_Slider'}
                      >
                        Hero Slider
                      </Radio>
                      <Radio
                        name="product[featured]"
                        defaultValue="Both"
                        defaultChecked={this.state.product.featured === 'Both'}
                      >
                        Both
                      </Radio>
                      <Radio
                        id="product-featured-no"
                        name="product[featured]"
                        defaultValue="No"
                        defaultChecked={
      this.state.product.featured === 'No' ||
      this.state.product.featured === undefined
      }
                      >
                        No
                      </Radio>
                    </Col>
                  </Row>
                </FormGroup>
                <FormGroup>
                  <Row>
                    <ControlLabel bsClass="col-lg-2 control-label">
                      {_T('admin.products.form.isFrontPage.label')}
                    </ControlLabel>
                    <Col lg={10}>
                      <input
                        id="product-isFrontPage"
                        type="checkbox"
                        name="product[isFrontPage]"
                        disabled={!this.props.canSelectFrontpageProduct &&
      !this.state.product.isFrontPage}
                        defaultChecked={this.state.product.isFrontPage}
                      />
                    </Col>
                  </Row>
                </FormGroup>
                <FormGroup>
                  <Row>
                    <ControlLabel bsClass="col-lg-2 control-label">
                      {_T('admin.products.form.enforceLogin.label')}
                    </ControlLabel>
                    <Col lg={10}>
                      <input
                        id="product-enforceLogin"
                        type="checkbox"
                        name="product[enforceLogin]"
                        defaultChecked={this.state.product.enforceLogin}
                      />
                    </Col>
                  </Row>
                </FormGroup>
                <FormGroup>
                  <Row>
                    <ControlLabel bsClass="col-lg-2 control-label">
                      {_T('admin.products.form.categories.label')}
                    </ControlLabel>
                    <Col lg={10}>
                      <FormCategorySelect
                        typeData="product"
                        selectedCategories={this.state.product.categoryIds}
                      />
                    </Col>
                  </Row>
                </FormGroup>
                <FormTextInput
                  id="product-brand"
                  name="brand"
                  typeData="product"
                  data={this.state.product}
                />
              </section>
            </FormSection>
            <FormSection
              title={_T('admin.products.form.title.vendor_information')}
            >
              <FormVendorInformation
                typeData="product"
                listingInformation={this.listingInformation()}
              />
            </FormSection>
            <FormSection
              title={_T('admin.products.form.image_upload.title')}
            >
              <Row>
                <Col xs={3}>
                  <ProductImageUploader addImage={this.addProductImage} />
                  <div
                    className="invalid-imageurls-error-message parsley-custom-error-message"
                    style={{
                      display: 'none',
                    }}
                  >
                    {_T('admin.products.form.image_upload.error')}
                  </div>
                </Col>
                {this.state.product.imageUrls.map((url, index) => <ImagePreview
                  key={Random.id()}
                  url={url}
                  removeImage={() => {
                    this.removeProductImage(index);
                  }}
                />)}
              </Row>
            </FormSection>
            <FormSection
              title={_T('admin.products.form.feature_image.title')}
            >
              <Row>
                <Col xs={3}>
                  <ProductImageUploader addImage={this.addFeaturedImage} />
                </Col>
                {this.showFeaturedImagePreview()}
              </Row>
            </FormSection>
            <Button
              className="btn btn-default waves-effect waves-light js-add-product"
              onClick={this.processProductForm}
            >
              {_T('admin.products.form.button.save')}
            </Button>
          </form>
        </AdminPageContent>
      </AdminPageContainer>
    );
  }
}

ProductFormElement.propTypes = {
  loading: PropTypes.bool,
  product: PropTypes.object,
  canSelectFrontpageProduct: PropTypes.bool.isRequired,
};

ProductFormElement.defaultProps = {
  canSelectFrontpageProduct: false,
};

export default ProductFormElement;
