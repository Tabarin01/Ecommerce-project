import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Country } from 'src/app/common/country';
import { Region } from 'src/app/common/region';
import { ShopFormService } from 'src/app/services/shop-form.service';

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
    private shopService: ShopFormService
  ) {}

  ngOnInit() {
    this.checkoutForm = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        lastName: new FormControl('', [
          Validators.required,
          Validators.minLength(2),
        ]),
        email: new FormControl('', [
          Validators.required,
          Validators.email,
          Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$'),
        ]),
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        region: [''],
        country: [''],
        zipCode: [''],
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        region: [''],
        country: [''],
        zipCode: [''],
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: [''],
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

  get firstName() {
    return this.checkoutForm.get('customer.firstName');
  }
  get lastName() {
    return this.checkoutForm.get('customer.lastName');
  }
  get email() {
    return this.checkoutForm.get('customer.email');
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
    }

    console.log(this.checkoutForm.get('customer').value);
    console.log(
      'The email address is ' + this.checkoutForm.get('customer').value.email
    );

    console.log(
      'The shipping address country is ' +
        this.checkoutForm.get('shippingAddress').value.country.name
    );
    console.log(
      'The shipping address region is ' +
        this.checkoutForm.get('shippingAddress').value.region.name
    );
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
      } else {
        this.billingAddressRegions = data;
      }

      //select first item by default
      formGroup.get('region').setValue(data[0]);
    });
  }
}
