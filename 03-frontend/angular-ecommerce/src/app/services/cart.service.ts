import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartItems: CartItem[] = [];

  totalPrice: Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity: Subject<number> = new BehaviorSubject<number>(0);

  constructor() {}

  addToCart(theCartItem: CartItem) {
    //check if we already have the item in our cart
    let itemExist: boolean = false;
    let existingItem: CartItem = undefined;

    if (this.cartItems.length > 0) {
      //find the item in the cart based on item id

      // for (let element of this.cartItems) {
      //   if (element.id === theCartItem.id) {
      //     existingItem = element;
      //     break;
      //   }
      // }
      existingItem = this.cartItems.find(
        (element) => element.id === theCartItem.id
      );

      // check if we found it
      itemExist = existingItem != undefined;
    }

    if (itemExist) {
      existingItem.quantity++;
    } else {
      this.cartItems.push(theCartItem);
    }

    //compute cart total price and total quantity
    this.computeCartTotals();
  }

  computeCartTotals() {
    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;

    for (let element of this.cartItems) {
      totalPriceValue += element.quantity * element.unitPrice;
      totalQuantityValue += element.quantity;
    }

    //publish the new values  ...  all subscribers will receive new data
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //log cart data just for debug
    this.logCartData(totalPriceValue, totalQuantityValue);
  }

  logCartData(totalPriceValue: number, totalQuantityValue: number) {
    console.log(`Contens of the cart`);
    for (let element of this.cartItems) {
      const subTotalPrice = element.quantity * element.unitPrice;
      console.log(
        `name: ${element.name}, quantity= ${element.quantity}, unitPrice= ${element.unitPrice}, subTotalPrice=${subTotalPrice}`
      );
    }
    console.log(
      `totalPrice: ${totalPriceValue.toFixed(
        2
      )}, totalQuantity:${totalQuantityValue}`
    );
    console.log(`------`);
  }

  decreaseQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;
    if (theCartItem.quantity === 0) {
      this.remove(theCartItem);
    } else {
      this.computeCartTotals();
    }
  }
  remove(theCartItem: CartItem) {
    //get index
    const itemIndex = this.cartItems.findIndex(
      (item) => item.id === theCartItem.id
    );
    if (itemIndex > -1) {
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }
}
