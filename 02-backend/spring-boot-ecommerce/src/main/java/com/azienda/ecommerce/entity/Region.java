package com.azienda.ecommerce.entity;


import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="region")
@Data
public class Region {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private int id;

    @Column(name="name")
    private String name;

    @ManyToOne
    @JoinColumn(name="country_id")
    private Country country;

}
