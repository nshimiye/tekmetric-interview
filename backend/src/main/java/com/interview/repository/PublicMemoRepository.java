package com.interview.repository;

import com.interview.model.PublicMemo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PublicMemoRepository extends JpaRepository<PublicMemo, String> {
    List<PublicMemo> findByBookId(String bookId);
    void deleteByBookId(String bookId);
}

