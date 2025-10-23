package azship.controller;

import azship.dto.FreightDTO;
import azship.service.FreightService;
import jakarta.validation.Valid; // Importar @Valid
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List; // Importar List

@RestController
@RequestMapping("/freights") // Rota base para fretes
@CrossOrigin(origins = "*") // Permite acesso do frontend (ajuste se necessário para produção)
public class FreightController {

    @Autowired
    private FreightService freightService;

    /**
     * Endpoint GET /freights
     * CORRIGIDO: Declara corretamente todos os @RequestParam para paginação e filtros.
     */
    @GetMapping
    public Page<FreightDTO> getAll(
            // Parâmetros de Paginação (com valores padrão)
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,

            // Parâmetros de Filtro (opcionais)
            @RequestParam(value = "searchTerm", required = false) String searchTerm,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "propertyKey", required = false) String propertyKey,
            @RequestParam(value = "propertyValue", required = false) String propertyValue
    ) {
        // Cria o objeto Pageable para passar ao service
        Pageable pageable = PageRequest.of(page, size);
        // Chama o service passando todos os parâmetros
        return freightService.findAll(pageable, searchTerm, status, propertyKey, propertyValue);
    }

    /**
     * Endpoint GET /freights/statuses
     * Retorna a lista de status únicos.
     */
    @GetMapping("/statuses")
    public List<String> getUniqueStatuses() {
        return freightService.findUniqueStatuses();
    }

    /**
     * Endpoint GET /freights/{id}
     * Busca um frete pelo ID.
     */
    @GetMapping("/{id}")
    public FreightDTO getById(@PathVariable Long id) {
        return freightService.findById(id);
    }

    /**
     * Endpoint POST /freights
     * Cria um novo frete. Ativa a validação do DTO com @Valid.
     */
    @PostMapping
    public FreightDTO create(@Valid @RequestBody FreightDTO dto) {
        return freightService.create(dto);
    }

    /**
     * Endpoint PUT /freights/{id}
     * Atualiza um frete existente. Ativa a validação do DTO com @Valid.
     */
    @PutMapping("/{id}")
    public FreightDTO update(@PathVariable Long id, @Valid @RequestBody FreightDTO dto) {
        return freightService.update(id, dto);
    }

    /**
     * Endpoint DELETE /freights/{id}
     * Deleta um frete pelo ID.
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        freightService.delete(id);
    }
}