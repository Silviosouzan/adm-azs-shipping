package azship.repository;

import azship.model.Freight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query; // <-- IMPORTAR @Query
import org.springframework.stereotype.Repository;

import java.util.List; // <-- IMPORTAR List

@Repository
public interface FreightRepository extends JpaRepository<Freight, Long>, JpaSpecificationExecutor<Freight> {

    @Query("SELECT DISTINCT f.status FROM Freight f WHERE f.status IS NOT NULL AND f.status <> '' ORDER BY f.status")
    List<String> findDistinctStatuses();
    // ------------------
}