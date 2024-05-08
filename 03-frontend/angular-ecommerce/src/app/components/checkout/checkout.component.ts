import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { Region } from 'src/app/common/region';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { ShopFormService } from 'src/app/services/shop-form.service';
import { CustomValidator } from 'src/app/validators/custom-validator';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css',
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;
  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonth: number[] = [];

  countries: Country[] = [];
  regions: Region[] = [];

  shippingAddressRegions: Region[] = [];
  billingAddressRegions: Region[] = [];

  constructor(
    private formBuilder: FormBuilder,
    private shopService: ShopFormService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) {}

  ngOnInit() {
    this.reviewCartDetails();

    this.checkoutForm = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
        region: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
        city: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
        region: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
          CustomValidator.notOnlyWhitespace,
        ]),
        cardNumber: new FormControl('', [
          Validators.pattern(`[0-9]{16}`),
          Validators.required,
        ]),
        securityCode: new FormControl('', [
          Validators.pattern(`[0-9]{3}`),
          Validators.required,
        ]),
        expirationMonth: new FormControl('', [Validators.required]),
        expirationYear: new FormControl('', [Validators.required]),
      }),
    });

    //populate countries
    this.shopService.getCountries().subscribe((data) => {
      // console.log(`Retrieved countries: ${JSON.stringify(data)}`);
      this.countries = data;
    });

    // populate credit card months

    const startMonth: number = new Date().getMonth() + 1;
    //console.log('startMonth:' + startMonth);

    this.shopService.getCreditCardMonths(startMonth).subscribe((data) => {
      // console.log(`Retrieved credit card months: ${JSON.stringify(data)}`);
      this.creditCardMonth = data;
    });
    //populate credit card years
    this.shopService.getCreditCardYears().subscribe((data) => {
      //  console.log(`Retrieved credit card years: ${JSON.stringify(data)}}`);
      this.creditCardYears = data;
    });
  }
  reviewCartDetails() {
    //subscribe to cartService.totalQuantity and totalPrice
    this.cartService.totalQuantity.subscribe(
      (totalQuantity) => (this.totalQuantity = totalQuantity)
    );

    this.cartService.totalPrice.subscribe(
      (totalPrice) => (this.totalPrice = totalPrice)
    );
  }

  justOneAddress(event) {
    if (event.target.checked) {
      this.checkoutForm.controls['billingAddress'].setValue(
        this.checkoutForm.controls['shippingAddress'].value
      );
      this.billingAddressRegions = this.shippingAddressRegions;
    } else {
      this.checkoutForm.controls['billingAddress'].reset();
      this.billingAddressRegions = [];
    }
  }

  onSubmit() {
    console.log('Handling the submit button');

    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      return;
    }
    // set up order
    let order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

    //get cart items
    const cartItems = this.cartService.cartItems;
    //create orderItems from cartItems

    // - long way
    // let orderItems: OrderItem[] = [];
    // for (let i = 0; i < cartItems.length; i++) {
    //   orderItems[i] = new OrderItem(cartItems[i]);
    // }

    // - short way
    let orderItems: OrderItem[] = cartItems.map((item) => new OrderItem(item));

    //set up purchase
    let purchase = new Purchase();

    //populate purchase - customer
    purchase.customer = this.checkoutForm.controls['customer'].value;

    //populate purchase - shipping address
    purchase.shippingAddress =
      this.checkoutForm.controls['shippingAddress'].value;
    const shippingRegion: Region = JSON.parse(
      JSON.stringify(purchase.shippingAddress.region)
    );
    const shippingCountry: Country = JSON.parse(
      JSON.stringify(purchase.shippingAddress.country)
    );
    purchase.shippingAddress.region = shippingRegion.name;
    purchase.shippingAddress.country = shippingCountry.name;

    //populate purchase - billing address
    purchase.billingAddress =
      this.checkoutForm.controls['billingAddress'].value;
    const billingRegion: Region = JSON.parse(
      JSON.stringify(purchase.billingAddress.region)
    );
    const billingCountry: Country = JSON.parse(
      JSON.stringify(purchase.billingAddress.country)
    );
    purchase.billingAddress.region = billingRegion.name;
    purchase.billingAddress.country = billingCountry.name;

    //populate purchase - order and orderItems
    purchase.order = order;
    purchase.orderItems = orderItems;
    //call REST API via service
    this.checkoutService.placeOrder(purchase).subscribe({
      next: (response) => {
        alert(
          `Your order has been received. \nOrder Tracking number: ${response.orderTrackingNumber}`
        );

        //reset cart
        this.resetCart();
      },
      error: (err) => {
        alert(`There was an error: ${err.message}`);
      },
    });
  }

  resetCart() {
    //data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);
    //form data
    this.checkoutForm.reset();

    //back to the main page
    this.router.navigateByUrl(`/products`);
  }

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutForm.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(
      creditCardFormGroup.value.expirationYear
    );

    let startMonth: number;

    if (currentYear === selectedYear) {
      startMonth = new Date().getMonth() + 1;
    } else {
      startMonth = 1;
    }

    this.shopService.getCreditCardMonths(startMonth).subscribe((data) => {
      //  console.log(`Retrieved credit card month ${JSON.stringify(data)}`);
      this.creditCardMonth = data;
    });
  }

  getRegions(formGroupName: string) {
    const formGroup = this.checkoutForm.get(formGroupName);

    const countryCode = formGroup.value.country.code;
    const countryName = formGroup.value.country.name;

    console.log(`${formGroupName} country code: ${countryCode}`);
    console.log(`${formGroupName} country name: ${countryName}`);

    this.shopService.getRegions(countryCode).subscribe((data) => {
      if (formGroupName === 'shippingAddress') {
        this.shippingAddressRegions = data;
      } else if (formGroupName === 'billingAddress') {
        this.billingAddressRegions = data;
      }

      //select first item by default
      formGroup.get('region').setValue(data[0]);
    });
  }
  get firstName() {
    return this.checkoutForm.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutForm.get('customer.lastName');
  }
  get email() {
    return this.checkoutForm.get('customer.email');
  }

  get shippingAddressStreet() {
    return this.checkoutForm.get('shippingAddress.street');
  }

  get shippingAddressCity() {
    return this.checkoutForm.get('shippingAddress.city');
  }

  get shippingAddressRegion() {
    return this.checkoutForm.get('shippingAddress.region');
  }

  get shippingAddressCountry() {
    return this.checkoutForm.get('shippingAddress.country');
  }
  get shippingAddressZipCode() {
    return this.checkoutForm.get('shippingAddress.zipCode');
  }

  get billingAddressStreet() {
    return this.checkoutForm.get('billingAddress.street');
  }

  get billingAddressCity() {
    return this.checkoutForm.get('billingAddress.city');
  }

  get billingAddressRegion() {
    return this.checkoutForm.get('billingAddress.region');
  }

  get billingAddressCountry() {
    return this.checkoutForm.get('billingAddress.country');
  }
  get billingAddressZipCode() {
    return this.checkoutForm.get('billingAddress.zipCode');
  }

  get creditCardType() {
    return this.checkoutForm.get('creditCard.cardType');
  }
  get creditOwner() {
    return this.checkoutForm.get('creditCard.nameOnCard');
  }
  get creditCardNumber() {
    return this.checkoutForm.get('creditCard.cardNumber');
  }
  get creditCardCvc() {
    return this.checkoutForm.get('creditCard.securityCode');
  }
}
