package com.azienda.ecommerce.service;

import com.azienda.ecommerce.dto.Purchase;
import com.azienda.ecommerce.dto.PurchaseResponse;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);
}
