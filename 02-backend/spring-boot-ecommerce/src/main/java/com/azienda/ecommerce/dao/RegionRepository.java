package com.azienda.ecommerce.dao;


import com.azienda.ecommerce.entity.Region;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.data.rest.core.annotation.RepositoryRestResource;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.util.List;

@CrossOrigin("http://localhost:4200")
@RepositoryRestResource
public interface RegionRepository extends JpaRepository<Region, Integer> {


    List<Region> findByCountryCode(@Param("code") String code);



}
