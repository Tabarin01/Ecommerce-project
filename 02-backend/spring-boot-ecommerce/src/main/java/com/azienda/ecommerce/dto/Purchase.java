package com.azienda.ecommerce.dto;


import com.azienda.ecommerce.entity.Address;
import com.azienda.ecommerce.entity.Customer;
import com.azienda.ecommerce.entity.Order;
import com.azienda.ecommerce.entity.OrderItem;
import lombok.Data;

import java.util.Set;

@Data
public class Purchase {

    private Customer customer;

    private Address shippingAddress;

    private Address billingAddress;

    private Order order;

    private Set<OrderItem> orderItems;

}
